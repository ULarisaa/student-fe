import React, { useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import QuizIcon from "@mui/icons-material/Quiz";
import MenuBookIcon from '@mui/icons-material/MenuBook';

const EventsCalendar = ({ events, onDateClick, onMonthChange }) => {
  const currentDate = new Date();
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const currentYear = currentDate.getFullYear();
  const firstDayRaw = new Date(currentYear, currentMonth, 1).getDay();
const firstDay = (firstDayRaw + 6) % 7;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleMonthChange = (direction) => {
    const newMonth = currentMonth + direction;
    if (newMonth >= 0 && newMonth < 12) {
      setCurrentMonth(newMonth);
      onMonthChange(newMonth);
    }
    
  };

  return (
    <Box sx={{
      border: '2px solid #1976d2', 
      borderRadius: '8px',
      padding: '16px',
      width: '400px',
      margin: 'auto',
      backgroundColor: 'white',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      transition: 'box-shadow 0.3s ease',
      '&:hover': {
        boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
        transform: 'translateY(-4px)',
        transition: 'box-shadow 0.3s ease, transform 0.3s ease',
      },
    }}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 2,
        gap: 1
      }}>
        <IconButton onClick={() => handleMonthChange(-1)} sx={{ padding: '8px', minWidth: 'unset', width: '36px', height: '36px' }}>
          <ArrowBackIcon sx={{ fontSize: '24px' }} />
        </IconButton>

        <Typography variant="h6" fontWeight="bold" sx={{ mx: 1, whiteSpace: 'nowrap' }}>
          {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })} {currentYear}
        </Typography>

        <IconButton onClick={() => handleMonthChange(1)} sx={{ padding: '8px', minWidth: 'unset', width: '36px', height: '36px' }}>
          <ArrowForwardIcon sx={{ fontSize: '24px' }} />
        </IconButton>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <Box key={day} sx={{ textAlign: 'center', fontWeight: 'bold', color: '#1976d2' }}>{day}</Box>
        ))}

        {Array(firstDay).fill(null).map((_, index) => <Box key={index} />)}

        {days.map(day => {
          const month = String(currentMonth + 1).padStart(2, '0');
          const dayString = String(day).padStart(2, '0');
          const dateString = `${currentYear}-${month}-${dayString}`;
          const todayString = new Date().toISOString().split('T')[0];
          const isToday = todayString === dateString;

          const event = events.find(e => {
            const [y, m, d] = e.date.split('-');
            const normalizedDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
            return normalizedDate === dateString;
          });

          let backgroundColor = 'transparent';
          let textColor = 'black';

        if (event) {
  const now = new Date();
  const startTime = new Date(event.start_time);
  const endTime = new Date(event.end_time);
  const hoursUntilStart = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  const hoursUntilEnd = (endTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (event.type === 'Assignment') {
    if (event.status === 'graded') {
      // Verde chiar și dacă e în următoarele 24h
      backgroundColor = '#4caf50';
      textColor = 'white';
    } else if (hoursUntilStart > 24) {
      backgroundColor = '#ff9800'; // portocaliu assignment viitor
      textColor = 'white';
    } else if (hoursUntilStart <= 0) {
      backgroundColor = '#ffcc80'; // portocaliu deschis assignment trecut
      textColor = 'white';
    } else {
      backgroundColor = '#f44336'; // roșu assignment în urm 24h
      textColor = 'white';
    }
  }

  if (event.type === 'Test') {
    if (hoursUntilEnd <= 24 && hoursUntilEnd > 0) {
      // roșu test în curs/pe final
      backgroundColor = '#f44336';
      textColor = 'white';
    } else if (hoursUntilEnd <= 0) {
      backgroundColor = '#90caf9'; // test trecut
      textColor = 'white';
    } else {
      backgroundColor = '#1976d2'; // test viitor normal
      textColor = 'white';
    }
  }
}


          return (
            <Box
              key={day}
              role="button"
              tabIndex={0}
              onClick={() => onDateClick(dateString)}
              sx={{
                padding: '12px',
                backgroundColor,
                color: textColor,
                textAlign: 'center',
                cursor: 'pointer',
                borderRadius: '8px',
                border: isToday ? '3px solid #000' : 'none',
                '&:hover': {
                  backgroundColor: event ? backgroundColor : '#f0f0f0',
                },
                fontWeight: isToday ? 'bold' : 'normal',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                {event?.type === "Test" && <QuizIcon sx={{ fontSize: 20, color: 'white' }} />}
                {event?.type === "Assignment" && <MenuBookIcon sx={{ fontSize: 20, color: 'white' }} />}
              </Box>
              {day}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default EventsCalendar; 