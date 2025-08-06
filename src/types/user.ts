// User interface to represent a user returned from your backend
export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  token: string; // ✅ add optional token
}



// Used for login POST request
export interface LoginCredentials {
  username: string;
  password: string;
}

// Used for signup POST request
export interface SignupData {
  username:    string;
  first_name:  string;
  last_name:   string;
  email:       string;
  password:    string;
  password2:   string;
}
