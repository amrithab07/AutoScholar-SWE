import React, { useState } from 'react';
import { 
  Paper, 
  InputBase, 
  IconButton, 
  Divider, 
  Menu,
  MenuItem,
  Button,
  Box
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('hybrid');
  const [anchorEl, setAnchorEl] = useState(null);
  
  const handleSearchTypeClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSearchTypeClose = (type) => {
    if (type) {
      setSearchType(type);
    }
    setAnchorEl(null);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query, searchType);
    }
  };

  const searchTypeLabels = {
    'hybrid': 'Hybrid Search',
    'keyword': 'Keyword Search',
    'vector': 'Semantic Search'
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSearch}
      sx={{ 
        p: '2px 4px', 
        display: 'flex', 
        alignItems: 'center', 
        width: '100%',
        maxWidth: 800,
        mx: 'auto',
        mb: 4,
        boxShadow: 3,
        borderRadius: 2
      }}
    >
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Search for research papers..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        inputProps={{ 'aria-label': 'search research papers' }}
      />
      
      <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
      
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Button
          onClick={handleSearchTypeClick}
          endIcon={<KeyboardArrowDownIcon />}
          sx={{ mr: 1, textTransform: 'none' }}
        >
          {searchTypeLabels[searchType]}
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => handleSearchTypeClose()}
        >
          <MenuItem onClick={() => handleSearchTypeClose('hybrid')}>Hybrid Search</MenuItem>
          <MenuItem onClick={() => handleSearchTypeClose('keyword')}>Keyword Search</MenuItem>
          <MenuItem onClick={() => handleSearchTypeClose('vector')}>Semantic Search</MenuItem>
        </Menu>
      </Box>
      
      <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
      
      <IconButton sx={{ p: '10px' }} aria-label="filter">
        <TuneIcon />
      </IconButton>
      
      <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
        <SearchIcon />
      </IconButton>
    </Paper>
  );
};

export default SearchBar;