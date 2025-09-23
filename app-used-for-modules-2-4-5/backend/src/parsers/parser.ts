export interface QueryParameters {
  skip?: string;
  take?: string;
  orderBy?: string;
}

export interface ParsedQueryParameters {
  skip?: number;
  take?: number;
  orderBy?: Record<string, string>;
}

export const QueryParser = {
  parseIntParam(value: string | undefined): number | undefined {
    if (value == null) {
      return undefined;
    }
    const parsed = Number.parseInt(value, 10);
    return parsed;
  },

  parseOrderBy(
    orderBy: string | undefined,
  ): Record<string, string> | undefined {
    if (orderBy !== undefined) {
      const [field, direction] = orderBy.split(":");
      return {
        [field]: direction.toLowerCase() || "asc",
      };
    }
  },

  parseQueryParameters(parameters: QueryParameters): ParsedQueryParameters {
    const parser = QueryParser;
    return {
      skip: parser.parseIntParam(parameters.skip),
      take: parser.parseIntParam(parameters.take),
      orderBy: parser.parseOrderBy(parameters.orderBy),
    };
  },
} as const;
