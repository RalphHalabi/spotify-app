import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import StarRatings from "react-star-ratings";
import Loading from "../Loading/Loading";
import "./Home.css";

interface Artist {
  id: string;
  name: string;
  followers: { total: number };
  popularity: number;
  images: { url: string }[];
}

function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const accessToken = localStorage.getItem("token");

  useEffect(() => {
    if (!accessToken) {
      alert("You don't have access to Spotify. Try logging in again or check your account.");
      navigate("/");
    }
  }, [accessToken, navigate]);

  const searchArtists = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const response = await axios.get(`https://api.spotify.com/v1/search?q=${query}&type=artist`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setArtists(response.data.artists.items);
    } catch (error) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="d-flex justify-content-center mt-5">
        <TextField
          placeholder="Search for an artist..."
          variant="outlined"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ width: "500px" }}
          InputProps={{
            endAdornment: (
              <IconButton onClick={searchArtists}>
                <SearchIcon />
              </IconButton>
            ),
          }}
        />
      </div>

      <div className="mt-5 mb-5">
        {isLoading && <Loading />}
        {isError && <div>Error loading data.</div>}

        <div className="card-ctr d-flex justify-content-center align-items-center flex-wrap">
          {artists.map((artist) => (
            <div className="card" key={artist.id} onClick={() => navigate(`/albums/${artist.id}`)}>
              <img src={artist.images[0]?.url} alt={artist.name} />
              <h2>{artist.name}</h2>
              <h6>{artist.followers.total} Followers</h6>
              <div className="stars-ctr">
                <StarRatings
                  rating={artist.popularity / 20}
                  starDimension="30px"
                  starSpacing="0px"
                  starRatedColor="gold"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Home;
