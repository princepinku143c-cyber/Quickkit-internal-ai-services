export const success = (res, data) => {
  return res.status(200).json({ success: true, data });
};

export const error = (res, message, code = 500) => {
  return res.status(code).json({ success: false, message });
};
