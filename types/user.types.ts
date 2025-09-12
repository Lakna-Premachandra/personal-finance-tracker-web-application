export interface User {
  User_ID: number;
  Username: string;
  Password: string;
  Email: string;
  DateOfBirth?: Date;
  Address?: string;
  Age?: number;
  Phone_No?: string;
  Type: 'Young-Adult' | 'Student';
  Created_Date: Date;
  Updated_Date: Date;
  ProfilePicture?: string | null;
}

export interface StudentDetails {
  Student_Details_ID: number;
  User_ID: number;
  Guardian_Contact_No: string;
  Created_Date: Date;
  Updated_Date: Date;
}

export interface YoungAdultDetails {
  YoungAdult_Details_ID: number;
  User_ID: number;
  Employment_Status: string;
  Created_Date: Date;
  Updated_Date: Date;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  age: number;
  type: "Student" | "Young-Adult";
  phoneNo?: string | null; 
  address?: string | null;  
  guardianContactNo?: string | null; 
  employmentStatus?: string | null;  
}

export interface LoginRequest {
  email: string;
  password: string;
}
export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user: {
    id: number;
    username: string;
    email: string;
    type: 'Young-Adult' | 'Student';
    profilePicture?: string | null;
  };
}
