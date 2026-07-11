export interface PasswordItem {
  id: string;
  name: string;
  account: string;
  password: string;
  notes: string;
}

export const mockPasswords: PasswordItem[] = [
  {
    id: "1",
    name: "weblate",
    account: "terrin.tian@spotec.net",
    password: "Tm962464...",
    notes: "weblate 翻译平台账号",
  },
  {
    id: "2",
    name: "Jenkins",
    account: "terrin",
    password: "abc123",
    notes: "Jenkins 持续集成服务器账号",
  },
  {
    id: "3",
    name: "figma",
    account: "jason.chen@spotec.net",
    password: "19891025Cjb",
    notes: "figma 设计工具账号",
  },
  {
    id: "4",
    name: "outlook",
    account: "terrin.tian@spotec.net",
    password: "Tm962464",
    notes: "outlook 邮箱账号",
  },
  {
    id: "5",
    name: "github",
    account: "terrin.tian@spotec",
    password: "tm962464...",
    notes: "github 账号",
  },
  {
    id: "6",
    name: "Teams",
    account: "terrin.tian@spotec",
    password: "Tm962464",
    notes: "Teams 团队账号",
  },
];
