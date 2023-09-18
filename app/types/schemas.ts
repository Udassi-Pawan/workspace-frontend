type User = {
  _id: string;
  name: string;
  email: string;
  groups: Group[];
  files: FileType[];
};

type Group = {
  _id: string;
  files: FileType[];
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

type FileType = {
  owner: string;
  name: string;
  type: string;
  extension: string;
  timestamp: number;
  _id: string;
};
