import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock } from 'lucide-react';

const DateTimePicker = ({ value, onChange, label, error, minDate = null }) => {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [initialized, setInitialized] = useState(false);

    // Parse initial value only once
    useEffect(() => {
        if (value && !initialized) {
            const dateObj = new Date(value);
            const dateStr = dateObj.toISOString().split('T')[0];
            const timeStr = dateObj.toTimeString().slice(0, 5);
            setDate(dateStr);
            setTime(timeStr);
            setInitialized(true);
        } else if (!value && !initialized) {
            setInitialized(true);
        }
    }, [value, initialized]);

    // Update parent when date or time changes (but not on initial load)
    useEffect(() => {
        if (initialized) {
            if (date && time) {
                const combined = `${date}T${time}`;
                onChange(combined);
            } else if (!date && !time) {
                onChange('');
            }
        }
    }, [date, time, initialized, onChange]);

    const today = new Date().toISOString().split('T')[0];
    const minDateStr = minDate ? new Date(minDate).toISOString().split('T')[0] : today;

    return (
        <div className="space-y-2">
            <label className="flex items-center gap-2 font-semibold text-slate-700 text-sm">
                <Calendar className="w-4 h-4" />
                {label}
            </label>
            <div className="flex gap-2">
                <div className="flex-1">
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        min={minDateStr}
                        className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                            error ? 'border-red-300 bg-red-50' : 'border-slate-300'
                        }`}
                    />
                </div>
                <div className="flex-1">
                    <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                            error ? 'border-red-300 bg-red-50' : 'border-slate-300'
                        }`}
                    />
                </div>
            </div>
            {error && (
                <p className="flex items-center gap-1 text-red-500 text-sm">
                    <Clock className="w-4 h-4" />
                    {error}
                </p>
            )}
        </div>
    );
};

export default DateTimePicker;