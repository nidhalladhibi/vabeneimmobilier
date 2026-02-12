const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    error: null,
};

const authReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
            localStorage.setItem("token", action.payload.token);
            return { 
                ...state, 
                user: action.payload.user, // Stockez seulement l'objet user
                token: action.payload.token,
                isAuthenticated: true 
            };
        case 'LOGIN_FAIL':
            return { ...state, error: action.payload, isAuthenticated: false };
        case 'LOGOUT':
            localStorage.removeItem("token");
            return { ...state, user: null, token: null, isAuthenticated: false };
        default:
            return state;
    }
};

export default authReducer;