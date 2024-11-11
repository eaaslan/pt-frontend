const getIstanbulTimeISO = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default getIstanbulTimeISO;

/*
 const now = new Date();
  const tzOffset = now.getTimezoneOffset();
return {
  localTimeISO: now.toLocaleString("en-US", {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: "true",
  }),
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  offset: tzOffset / -60,
};

*/
