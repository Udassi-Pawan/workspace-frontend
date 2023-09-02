type User = {
  _id: string;
  name: string;
  email: string;
  groups: Group[];
};

type Group = {
  _id: string;

  name: string;
  members: User[];
};
