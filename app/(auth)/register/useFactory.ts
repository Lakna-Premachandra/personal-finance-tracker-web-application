// userFactory.ts
interface BaseUser {
  username: string
  email: string
  password: string
  confirmPassword: string
  dateOfBirth: string
  age: number
  phoneNo?: string
  address?: string
}

interface Student extends BaseUser {
  type: "Student"
  guardianContactNo?: string
}

interface YoungAdult extends BaseUser {
  type: "Young-Adult"
  employmentStatus?: string
}

export class UserFactory {
  static createUser(formData: any, age: number) {
    if (age >= 12 && age <= 17) {
      const student: Student = {
        ...formData,
        age,
        type: "Student",
        guardianContactNo: formData.guardianContactNo,
      }
      return student
    }

    if (age >= 18 && age <= 25) {
      const youngAdult: YoungAdult = {
        ...formData,
        age,
        type: "Young-Adult",
        employmentStatus: formData.employmentStatus || "Unemployed",
      }
      return youngAdult
    }

    throw new Error("Invalid age range")
  }
}
