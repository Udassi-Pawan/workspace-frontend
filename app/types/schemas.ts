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
  history: Message[];
  docs: string[];
};

type Message = {
  sender: string;
  timestamp: number;
  text: string;
  senderName: string;
  image: string;
};
