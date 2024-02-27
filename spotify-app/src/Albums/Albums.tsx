import "./Albums.css";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useQuery } from "react-query";
import Loading from "../Loading/Loading";
import { useEffect } from "react";

interface Album {
  id: string;
  name: string;
  images: { url: string }[];
  release_date: string;
  total_tracks: number;
  external_urls: { spotify: string };
  artists: { name: string }[];
}

function Albums() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("token");

  useEffect(() => {
    if (!accessToken) {
      alert("You don't have access to Spotify. Try logging in again or check your account.");
      navigate("/");
    }
  });

  const { data: artist, isLoading: isLoadingArtist, isError: isErrorArtist } = useQuery(
    "searchArtists2",
    async () => {
      try {
        const response = await axios.get(`https://api.spotify.com/v1/artists/${id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.data.error.message === "The access token expired") {
          navigate("/");
        }
        throw error;
      }
    }
  );

  const { data, isLoading, isError } = useQuery(
    "searchAlbums",
    async () => {
      try {
        const response = await axios.get(`https://api.spotify.com/v1/artists/${id}/albums`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        return response.data.items as Album[];
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.data.error.message === "The access token expired") {
          navigate("/");
        }
        throw error;
      }
    }
  );

  return (
    <>
      {isLoadingArtist && <Loading />}
      {isErrorArtist && <div><h1>Error loading data.</h1></div>}

      <h1 style={{ paddingTop: "30px", paddingLeft: "80px" }}>{artist?.name}</h1>
      <h3 style={{ color: "grey", paddingLeft: "80px" }}>Albums</h3>

      <div className="mt-5 mb-5">
        {isLoading && <Loading />}
        {isError && <div><h1>Unknown.</h1></div>}

        <div className="card-ctr d-flex justify-content-center align-items-center flex-wrap">
          {data?.map((album: Album) => (
            <div className="albums-card" key={album.id}>
              <img src={album.images[0]?.url} alt={album.name} />
              <h2 title={album.name}>{album.name}</h2>
              <h6 className="header-first">
                {album.artists.map((art, index) => album.artists.length === 0 || album.artists.length - 1 === index ? art.name : art.name + ", ")}
              </h6>
              <h6 className="header-second">{album.release_date}</h6>
              <h6 className="header-third">{album.total_tracks} {album.total_tracks <= 1 ? "track" : "tracks"}</h6>
              <button><a className="d-block w-100 h-100" href={album.external_urls.spotify}>Preview on Spotify</a></button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Albums;
