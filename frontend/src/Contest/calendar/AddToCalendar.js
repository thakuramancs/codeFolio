import React, { useState } from 'react';
import { 
  IconButton,
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText, 
  Tooltip
} from '@mui/material';
import { 
  CalendarToday,
  Google, 
  Microsoft, 
  Download 
} from '@mui/icons-material';
import { createEvents } from 'ics';
import { saveAs } from 'file-saver';

// Simple utility for formatting dates for calendar URLs
const formatGoogleCalendarDate = (date) => {
  return date.toISOString().replace(/-|:|\.\d+/g, '');
};

const AddToCalendar = ({ contest }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Create event details from contest data
  const startTime = new Date(contest.startTime);
  const endTime = new Date(startTime.getTime() + contest.duration);
  
  const title = contest.name;
  const description = `${contest.name} on ${contest.platform}. Don't miss it!\n\nContest URL: ${contest.url}`;
  const location = contest.url;

  // Google Calendar
  const addToGoogle = () => {
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatGoogleCalendarDate(startTime)}/${formatGoogleCalendarDate(endTime)}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}&sf=true&output=xml`;
    window.open(googleCalendarUrl, '_blank');
    handleClose();
  };

  // Outlook.com Calendar
  const addToOutlook = () => {
    const outlookCalendarUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(title)}&startdt=${startTime.toISOString()}&enddt=${endTime.toISOString()}&body=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;
    window.open(outlookCalendarUrl, '_blank');
    handleClose();
  };

  // Create and download ICS file
  const downloadICS = () => {
    // Format for ics library
    const startArray = [
      startTime.getFullYear(),
      startTime.getMonth() + 1, // ics months are 1-based
      startTime.getDate(),
      startTime.getHours(),
      startTime.getMinutes()
    ];
    
    const endArray = [
      endTime.getFullYear(),
      endTime.getMonth() + 1,
      endTime.getDate(),
      endTime.getHours(),
      endTime.getMinutes()
    ];

    const event = {
      start: startArray,
      end: endArray,
      title: title,
      description: description,
      location: location,
      url: contest.url,
      alarms: [
        {
          action: 'display',
          description: 'Reminder',
          trigger: { hours: 1, before: true }
        }
      ]
    };

    createEvents([event], (error, value) => {
      if (error) {
        console.error(error);
        return;
      }
      
      const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' });
      saveAs(blob, `${contest.platform}-${title.replace(/\s+/g, '-')}.ics`);
    });
    
    handleClose();
  };

  return (
    <>
      <Tooltip title="Add to Calendar">
        <IconButton
          size="small"
          color="primary"
          onClick={handleClick}
          sx={{
            fontSize: '0.75rem',
            p: '4px',
            border: '1px solid rgba(33, 150, 243, 0.5)',
            backgroundColor: 'rgba(33, 150, 243, 0.05)',
            '&:hover': {
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
            }
          }}
        >
          <CalendarToday fontSize="small" />
        </IconButton>
      </Tooltip>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: '12px',
            minWidth: '200px',
            mt: 1
          }
        }}
      >
        <MenuItem onClick={addToGoogle}>
          <ListItemIcon>
            <Google />
          </ListItemIcon>
          <ListItemText>Google Calendar</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={addToOutlook}>
          <ListItemIcon>
            <Microsoft />
          </ListItemIcon>
          <ListItemText>Outlook Calendar</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={downloadICS}>
          <ListItemIcon>
            <Download />
          </ListItemIcon>
          <ListItemText>Download ICS File</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default AddToCalendar; 