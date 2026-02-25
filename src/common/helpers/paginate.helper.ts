export function paginate(page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;
  return { skip, take: limit };
}

export function paginatedResult<T>(
  data: T[],
  total: number,
  page: number = 1,
  limit: number = 10,
) {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
    },
  };
}
