export enum Role {
  Tutor = 0,
  Student = 1,
}
// declare global {
//   interface Number {
//     isTutor(): boolean;
//     isStudent(): boolean;
//   }
// }
// Number.prototype.isTutor = function (): boolean {
//   return this.valueOf() === Role.Tutor;
// };
// Number.prototype.isStudent = function (): boolean {
//   return this.valueOf() === Role.Student;
// };
declare global {
  interface Number {
    readonly isTutor: boolean;
    readonly isStudent: boolean;
  }
}
Object.defineProperty(Number.prototype, "isTutor", {
  get: function (): boolean {
    return this.valueOf() === Role.Tutor;
  },
  enumerable: false,
  configurable: true,
});

Object.defineProperty(Number.prototype, "isStudent", {
  get: function (): boolean {
    return this.valueOf() === Role.Student;
  },
  enumerable: false,
  configurable: true,
});

export type User = {
  username: string;
  role: number;
  name: string;
};
