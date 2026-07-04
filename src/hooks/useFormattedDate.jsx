import { useState, useEffect } from "react";

/**
 * Custom hook to format a date into [date, time] array
 * @param {string | Date} datetime - The date to format
 * @returns {[string, string]} - [formattedDate, formattedTime]
 */
export default function useFormattedDate(datetime) {
  const [formatted, setFormatted] = useState(["", ""]);

  useEffect(() => {
    if (!datetime) return;

    const dateObj = new Date(datetime);
    const options = {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };
    const [date, time] = new Intl.DateTimeFormat("en-US", options)
      .format(dateObj)
      .split(" at ");
    setFormatted([date, time]);
  }, [datetime]);

  return formatted;
}
