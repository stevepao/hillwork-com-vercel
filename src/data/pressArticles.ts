import pressArticlesJson from '../../assets/pao-articles-press.json';

export type PressArticle = {
  title: string;
  image: string;
  publication: string;
  date: string;
  url: string;
};

export const pressArticles = (pressArticlesJson as PressArticle[])
  .slice()
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
