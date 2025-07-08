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
  password: string;
  email: string;
  dateOfBirth?: string;
  address?: string;
  age?: number;
  phoneNo?: string;
  type: 'Young-Adult' | 'Student';
  // Student specific
  guardianContactNo?: string;
  // Young Adult specific
  employmentStatus?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
