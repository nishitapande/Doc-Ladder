import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";

const SearchBar = ({
  endpoint,
  setData,
  filterKeys = [],
  placeholder,
  refreshKey,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [localData, setLocalData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(endpoint);
        // console.log(response);
        const fetchedData = response.data.recordsets[0];
        console.log("fetcheddata: ", fetchedData);
        setLocalData(fetchedData);

        setData(fetchedData);
      } catch (error) {
        console.log(error);
        console.error("Error fetching data", error);
      }
    };

    fetchData();
  }, [endpoint, refreshKey]);

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  useEffect(() => {
    if (!filterKeys) {
      return;
    }
    if (searchTerm === "") {
      setData(localData);
    } else {
      const filteredData = localData.filter((item) => {
        return filterKeys.some((key) => {
          const value = item[key] || "";
          return value.toLowerCase().includes(searchTerm.toLowerCase());
        });
      });
      setData(filteredData);
    }
  }, [searchTerm, localData, setData, filterKeys]);

  return (
    <div
      style={{
        marginBottom: "25px",
      }}
    >
      <form className="search-container">
        <input
          type="text"
          id="search-bar"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleSearch}
        />
      </form>
    </div>
  );
};

export default SearchBar;
