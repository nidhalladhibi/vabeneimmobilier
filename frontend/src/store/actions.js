import Cookies from "js-cookie";

// Action de connexion
export const login = (userData) => (dispatch) => {
  const user = { ...userData.user }; // Assurez-vous de stocker seulement les données nécessaires
  const token = userData.token;

  Cookies.set("user", JSON.stringify(user), { expires: 7, secure: true, sameSite: 'Strict', path: '/' });
  Cookies.set("token", token, { expires: 7, secure: true, sameSite: 'Strict', path: '/' });

  dispatch({ type: "LOGIN_SUCCESS", payload: { user, token } });
};

// Action de déconnexion
export const logout = () => (dispatch) => {
  // Remove cookies securely
  Cookies.remove("user", { secure: true, sameSite: 'Strict', path: '/' });
  Cookies.remove("token", { secure: true, sameSite: 'Strict', path: '/' });

  dispatch({ type: "LOGOUT" });
};
