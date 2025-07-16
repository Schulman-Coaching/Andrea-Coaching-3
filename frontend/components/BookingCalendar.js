// Booking Calendar Component for Andrea Schulman's Scheduling System
// Supports dual timezone (Israel/US Eastern) with mobile-first design

import React, { useState, useEffect, useCallback } from 'react';
import { format, addDays, startOfWeek, isSameDay, parseISO } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime, format as formatTz } from 'date-fns-tz';

const BookingCalendar = ({ 
    serviceType = 'one_on_one', 
    onBookingSelect, 
    userTimezone = 'America/New_York' 
}) => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [availability, setAvailability] = useState([]);
    const [bookedSlots, setBookedSlots] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const andreaTimezone = 'Asia/Jerusalem';
    const serviceDuration = serviceType === 'one_on_one' ? 60 : 90;
    const bufferTime = 15;

    // Detect user's timezone
    const detectUserTimezone = useCallback(() => {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timezone.includes('Jerusalem') || timezone.includes('Tel_Aviv')) {
            return 'Asia/Jerusalem';
        } else if (timezone.includes('New_York') || timezone.includes('Eastern')) {
            return 'America/New_York';
        }
        return timezone;
    }, []);

    // Load availability data
    const loadAvailability = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/availability');
            const data = await response.json();
            setAvailability(data);
        } catch (err) {
            setError('Failed to load availability');
            console.error('Availability load error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load booked slots
    const loadBookedSlots = useCallback(async () => {
        try {
            const response = await fetch('/api/booked-slots');
            const data = await response.json();
            setBookedSlots(data);
        } catch (err) {
            console.error('Booked slots load error:', err);
        }
    }, []);

    useEffect(() => {
        loadAvailability();
        loadBookedSlots();
    }, [loadAvailability, loadBookedSlots]);

    // Check if date is available
    const isDateAvailable = useCallback((date) => {
        const dayOfWeek = date.getDay();
        return availability.some(slot => slot.day_of_week === dayOfWeek);
    }, [availability]);

    // Generate time slots for selected date
    const generateTimeSlots = useCallback((date) => {
        const dayOfWeek = date.getDay();
        const dayAvailability = availability.filter(slot => 
            slot.day_of_week === dayOfWeek
        );

        if (dayAvailability.length === 0) return [];

        const slots = [];
        
        dayAvailability.forEach(avail => {
            const [startHour, startMinute] = avail.start_time.split(':').map(Number);
            const [endHour, endMinute] = avail.end_time.split(':').map(Number);
            
            const startDateTime = new Date(date);
            startDateTime.setHours(startHour, startMinute, 0, 0);
            
            const endDateTime = new Date(date);
            endDateTime.setHours(endHour, endMinute, 0, 0);
            
            const slotDuration = serviceDuration + bufferTime;
            
            for (let current = new Date(startDateTime); 
                 current < endDateTime; 
                 current.setMinutes(current.getMinutes() + slotDuration)) {
                
                // Convert from Andrea's timezone to user's timezone for display
                const userTime = utcToZonedTime(
                    zonedTimeToUtc(current, andreaTimezone), 
                    userTimezone
                );
                
                slots.push({
                    datetime: new Date(current),
                    userTime: userTime,
                    isBooked: isSlotBooked(current)
                });
            }
        });

        return slots;
    }, [availability, serviceDuration, bufferTime, andreaTimezone, userTimezone]);

    // Check if slot is booked
    const isSlotBooked = useCallback((datetime) => {
        return bookedSlots.some(booking => {
            const bookingTime = parseISO(booking.scheduled_at);
            return Math.abs(bookingTime - datetime) < 60000; // Within 1 minute
        });
    }, [bookedSlots]);

    // Format time for display
    const formatTimeForDisplay = useCallback((datetime) => {
        return formatTz(datetime, 'HH:mm', { timeZone: userTimezone });
    }, [userTimezone]);

    // Format date for display
    const formatDateForDisplay = useCallback((date) => {
        return formatTz(date, 'EEEE, MMMM d, yyyy', { timeZone: userTimezone });
    }, [userTimezone]);

    // Handle date selection
    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setSelectedTime(null);
        setError(null);
    };

    // Handle time selection
    const handleTimeSelect = (timeSlot) => {
        if (timeSlot.isBooked) return;
        
        setSelectedTime(timeSlot);
        
        if (onBookingSelect) {
            onBookingSelect({
                date: selectedDate,
                time: timeSlot.datetime,
                userTime: timeSlot.userTime,
                timezone: userTimezone,
                duration: serviceDuration
            });
        }
    };

    // Generate calendar days
    const generateCalendarDays = () => {
        const start = startOfWeek(currentMonth);
        const days = [];
        
        for (let i = 0; i < 42; i++) { // 6 weeks
            const day = addDays(start, i);
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
            const isToday = isSameDay(day, new Date());
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isAvailable = isDateAvailable(day);
            const isPast = day < new Date().setHours(0, 0, 0, 0);
            
            days.push({
                date: day,
                isCurrentMonth,
                isToday,
                isSelected,
                isAvailable: isAvailable && !isPast,
                isPast
            });
        }
        
        return days;
    };

    const calendarDays = generateCalendarDays();
    const timeSlots = selectedDate ? generateTimeSlots(selectedDate) : [];

    if (loading) {
        return (
            <div className="booking-calendar loading">
                <div className="loading-spinner">Loading calendar...</div>
            </div>
        );
    }

    return (
        <div className="booking-calendar">
            <div className="calendar-header">
                <h3>Schedule Your {serviceType.replace('_', ' ')} Session</h3>
                <div className="timezone-info">
                    <span>Your timezone: {userTimezone.split('/')[1]?.replace('_', ' ')}</span>
                </div>
            </div>

            {error && (
                <div className="calendar-error">
                    {error}
                </div>
            )}

            <div className="calendar-body">
                {/* Date Picker */}
                <div className="date-picker-section">
                    <div className="calendar-nav">
                        <button 
                            className="nav-btn"
                            onClick={() => setCurrentMonth(addDays(currentMonth, -30))}
                        >
                            ‹
                        </button>
                        <h4>{format(currentMonth, 'MMMM yyyy')}</h4>
                        <button 
                            className="nav-btn"
                            onClick={() => setCurrentMonth(addDays(currentMonth, 30))}
                        >
                            ›
                        </button>
                    </div>

                    <div className="calendar-grid">
                        <div className="weekdays">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="weekday">{day}</div>
                            ))}
                        </div>
                        
                        <div className="days-grid">
                            {calendarDays.map((day, index) => (
                                <button
                                    key={index}
                                    className={`
                                        date-cell 
                                        ${day.isCurrentMonth ? 'current-month' : 'other-month'}
                                        ${day.isToday ? 'today' : ''}
                                        ${day.isSelected ? 'selected' : ''}
                                        ${day.isAvailable ? 'available' : 'unavailable'}
                                        ${day.isPast ? 'past' : ''}
                                    `}
                                    onClick={() => day.isAvailable && handleDateSelect(day.date)}
                                    disabled={!day.isAvailable}
                                >
                                    {format(day.date, 'd')}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Time Picker */}
                <div className="time-picker-section">
                    <h4>Select Time</h4>
                    {!selectedDate ? (
                        <p className="select-date-prompt">Please select a date first</p>
                    ) : timeSlots.length === 0 ? (
                        <p className="no-times">No available times for this date</p>
                    ) : (
                        <div className="time-slots-grid">
                            {timeSlots.map((slot, index) => (
                                <button
                                    key={index}
                                    className={`
                                        time-slot 
                                        ${slot.isBooked ? 'booked' : 'available'}
                                        ${selectedTime?.datetime?.getTime() === slot.datetime.getTime() ? 'selected' : ''}
                                    `}
                                    onClick={() => handleTimeSelect(slot)}
                                    disabled={slot.isBooked}
                                >
                                    {formatTimeForDisplay(slot.userTime)}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Selection Summary */}
            {selectedDate && selectedTime && (
                <div className="selection-summary">
                    <h4>Selected Appointment</h4>
                    <div className="appointment-details">
                        <p><strong>Date:</strong> {formatDateForDisplay(selectedDate)}</p>
                        <p><strong>Time:</strong> {formatTimeForDisplay(selectedTime.userTime)}</p>
                        <p><strong>Duration:</strong> {serviceDuration} minutes</p>
                        <p><strong>Service:</strong> {serviceType.replace('_', ' ')}</p>
                    </div>
                    <button 
                        className="btn btn--primary proceed-btn"
                        onClick={() => onBookingSelect && onBookingSelect({
                            date: selectedDate,
                            time: selectedTime.datetime,
                            userTime: selectedTime.userTime,
                            timezone: userTimezone,
                            duration: serviceDuration
                        })}
                    >
                        Proceed to Payment
                    </button>
                </div>
            )}
        </div>
    );
};

export default BookingCalendar;