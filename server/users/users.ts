interface User {
  room: string;
  id: string;
}

class Users {
  private _users: Array<User>;

  constructor() {
    this._users = [];
  }

  public addUser(id: string, room: string) {
    // Clean the data
    room = room.trim().toLowerCase();

    // Validate the data
    if (!room) {
      return {
        error: 'Username and room are required!',
      };
    }

    const existingUser = this._users.find((user) => {
      return user.room === room && user.id === user.id;
    });

    if (existingUser) {
      return {
        error: 'Username is in use!',
      };
    }

    const user = { id, room };
    this._users.push(user);
    return { user };
  }

  public removeUser(id: string) {
    const index = this._users.findIndex((user) => user.id === id);

    if (index !== -1) {
      return this._users.splice(index, 1)[0];
    }
  }

  public getUser(id: string) {
    return this._users.find((user) => user.id === id);
  }

  public getUsersInRoom(room: string) {
    room = room.trim().toLowerCase();
    return this._users.filter((user) => user.room === room);
  }
}

export const users = new Users();
