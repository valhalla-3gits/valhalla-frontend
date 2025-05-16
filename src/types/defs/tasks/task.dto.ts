import type { RankDto } from '@/types/defs/ranks/rank.dto.ts'

export interface TaskDto {
  token: string;
  name: string;
  description: string;
  prototype: string;
  tests: TestDto[];
  author_token: string;
  language: LanguageDto;
  rank: RankDto;
  is_favourite: boolean;
}

export interface TestDto {
  token: string;
  name: string;
  test: string;
  test_header: string;
  test_result: string;
}

export interface LanguageDto {
  token: string;
  name: string;
  shortName: string;
}
