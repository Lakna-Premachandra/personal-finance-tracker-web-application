// userFactory.ts
interface BaseUser {
  username: string
  email: string
  password: string
  confirmPassword: string
  dateOfBirth: string
  age: number
  phoneNo?: string | null
  address?: string | null
}

interface Student extends BaseUser {
  type: "Student"
  guardianContactNo?: string | null
}

interface YoungAdult extends BaseUser {
  type: "Young-Adult"
  employmentStatus?: string | null
}

export class UserFactory {
  // Helper function to convert empty strings to null
  private static sanitizeOptionalField(value: string | undefined): string | null {
    if (!value || value.trim() === '') {
      return null;
    }
    return value.trim();
  }

  static createUser(formData: any, age: number): Student | YoungAdult | null {
    // Base user data with null conversion for optional fields
    const baseUserData = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      dateOfBirth: formData.dateOfBirth,
      age,
      phoneNo: this.sanitizeOptionalField(formData.phoneNo),
      address: this.sanitizeOptionalField(formData.address),
    };

    if (age >= 12 && age <= 17) {
      const student: Student = {
        ...baseUserData,
        type: "Student",
        guardianContactNo: this.sanitizeOptionalField(formData.guardianContactNo),
      };
      return student;
    }

    if (age >= 18 && age <= 25) {
      const youngAdult: YoungAdult = {
        ...baseUserData,
        type: "Young-Adult",
        employmentStatus: this.sanitizeOptionalField(formData.employmentStatus) || "Unemployed",
      };
      return youngAdult;
    }

    return null;
  }
}