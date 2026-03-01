export const getToday = () =>
  new Date().toISOString().split("T")[0];

export const getYesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
};