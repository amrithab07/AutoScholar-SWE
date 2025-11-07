import React, { useState, useEffect } from 'react';
import profileStorage from '../utils/profileStorage';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Checkbox,
  IconButton,
  Collapse,
  Button,
  Divider
} from '@mui/material';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import DescriptionIcon from '@mui/icons-material/Description';

const PaperCard = ({ paper, selectable = false, selected = false, onToggleSelect }) => {
  const [expanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!paper) return;
    const id = paper.id ?? paper.paper_id ?? paper.doi ?? paper.title;
    setSaved(profileStorage.isPaperSaved(id));
  }, [paper]);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleSaveClick = () => {
    // toggle save in profile storage
    try {
      const nowSaved = profileStorage.savePaper(paper);
      setSaved(nowSaved);
    } catch (err) {
      console.error('Failed to save paper', err);
    }
  };

  return (
    <Card sx={{ mb: 2, boxShadow: 2, borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {selectable && (
              <Checkbox checked={!!selected} onChange={() => onToggleSelect && onToggleSelect(paper)} />
            )}
            <Typography variant="h6" component="div" gutterBottom>
              {paper.title}
            </Typography>
          </Box>
          <IconButton onClick={handleSaveClick} aria-label="save paper">
            {saved ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
          </IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {formatAuthors(paper.authors)}
        </Typography>

        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
          {paper.journal} {paper.published ? paper.published : ''}
          {paper.citation_count ? ` • ${paper.citation_count} citations` : ''}
        </Typography>

        <Box sx={{ mt: 1, mb: 1 }}>
          {paper.keywords?.slice(0, 5).map((keyword, index) => (
            <Chip
              key={index}
              label={keyword}
              size="small"
              sx={{ mr: 0.5, mb: 0.5 }}
              variant="outlined"
            />
          ))}
        </Box>

        <Button
          onClick={handleExpandClick}
          endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{ textTransform: 'none', p: 0, mt: 1 }}
        >
          {expanded ? 'Show less' : 'Show abstract'}
        </Button>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" paragraph>
              {paper.abstract}
            </Typography>

            {paper.ai_summary && (
              <>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" gutterBottom>
                  AI Summary
                </Typography>
                <Typography variant="body2" paragraph>
                  {paper.ai_summary}
                </Typography>
              </>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                startIcon={<DescriptionIcon />}
                variant="outlined"
                size="small"
                sx={{ mr: 1 }}
                href={paper.url}
                target="_blank"
              >
                PDF
              </Button>
            </Box>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default PaperCard;

// Helper to format author lists robustly
function formatAuthors(authors) {
  if (!authors) return '';
  // If it's a single string
  if (typeof authors === 'string') return authors;
  // If it's an array
  if (Array.isArray(authors)) {
    const parts = authors.map(a => {
      if (!a) return '';
      if (typeof a === 'string') return a;
      // Common shapes: {name: 'A B'}, {given:'A', family:'B'}, {first:'A', last:'B'}
      if (a.name) return a.name;
      if (a.given && a.family) return `${a.given} ${a.family}`;
      if (a.first && a.last) return `${a.first} ${a.last}`;
      // Fallback to JSON string (but avoid [object Object])
      try { return JSON.stringify(a); } catch (e) { return String(a); }
    }).filter(Boolean);
    return parts.join(', ');
  }
  // If it's an object, try to extract name-like fields
  if (typeof authors === 'object') {
    if (authors.name) return authors.name;
    if (authors.given && authors.family) return `${authors.given} ${authors.family}`;
    return JSON.stringify(authors);
  }
  return String(authors);
}