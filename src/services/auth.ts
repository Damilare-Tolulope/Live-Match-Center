import { jwtDecode } from 'jwt-decode';

const getUser = () => {
	return JSON.parse(localStorage.getItem('user') || '{}');
};

const setUser = (user: any) => {
	localStorage.setItem('user', JSON.stringify(user));
};

const setToken = (token: string) => {
	window.localStorage.setItem('token', token);
};

const setRefreshToken = (token: string) => {
	window.localStorage.setItem('refreshToken', token);
};

const getToken = () => {
	if (typeof window !== 'undefined') {
		return window.localStorage.getItem('token');
	}
};

const getRefreshToken = () => {
	return window.localStorage.getItem('refreshToken');
};

const getDecodedJwt = () => {
	try {
		const token = getToken();
		return jwtDecode(token!);
	} catch (e) {
		return {};
	}
};

const logOut = () => {
	window.localStorage.clear();
	window.location.replace('/login');
};

const isAuthenticated = () => {
	try {
		const decodedToken: any = getDecodedJwt();
		
		const exp = decodedToken?.exp;
		const currentTime = Date.now() / 1000;
		if (exp && exp < currentTime) {
			return false;
		}
		return !!getToken();
	} catch (e) {
		return false;
	}
};

const Auth = {
	isAuthenticated,
	getDecodedJwt,
	setToken,
	setUser,
    getUser,
	getToken,
	setRefreshToken,
	getRefreshToken,
	logOut,
};

export default Auth;