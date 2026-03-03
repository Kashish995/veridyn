import api from "./api";

export const getCalendarData = async (year) => {
  const response = await api.get(`/analytics/calendar?year=${year}`);
  return response.data;
};