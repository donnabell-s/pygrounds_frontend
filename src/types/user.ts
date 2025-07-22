// User interface to represent a user returned from your backend
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'learner';
  first_name?: string;
  last_name?: string;
}


// Used for login POST request
export interface LoginCredentials {
  username: string;
  password: string;
}

// Used for signup POST request
export interface SignupData {
    username: string;
    fname: string;
    lname: string;
    email: string;
    password: string;
}
