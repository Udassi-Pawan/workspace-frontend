type User = {
  _id: string;
  name: string;
  email: string;
  groups: Group[];
  files: FileType[];
};

type Group = {
  image: string;
  description: string;
  _id: string;
  files: FileType[];
  name: string;
  members: User[];
  history: Message[];
  docs: Doc[];
};

type Message = {
  sender: string;
  timestamp: number;
  text: string;
  senderName: string;
  image: string;
  video: string;
};

type FileType = {
  owner: User;
  name: string;
  type: string;
  extension: string;
  timestamp: number;
  _id: string;
};

type Doc = {
  name: string;
  _id: string;
  timestamp: string;
};
