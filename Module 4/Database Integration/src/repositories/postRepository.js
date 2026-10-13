const prisma = require('../db/prisma');

function numericId(id) {
  const value = Number(id);
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}

function safeDatabaseError(error) {
  if (error && error.code === 'P2002') {
    const mapped = new Error('A record with these values already exists');
    mapped.statusCode = 409;
    return mapped;
  }
  if (error && error.code === 'P2003') {
    const mapped = new Error('The referenced record does not exist');
    mapped.statusCode = 422;
    return mapped;
  }
  return error;
}

async function withSafeErrors(operation) {
  try {
    return await operation();
  } catch (error) {
    throw safeDatabaseError(error);
  }
}

async function findAll() {
  return withSafeErrors(() => prisma.post.findMany({ orderBy: { id: 'asc' } }));
}

async function findById(id) {
  const postId = numericId(id);
  if (postId === null) return null;
  return withSafeErrors(() => prisma.post.findUnique({ where: { id: postId } }));
}

async function create(fields) {
  return withSafeErrors(() => prisma.post.create({
    data: {
      title: fields.title,
      body: fields.body === undefined ? '' : fields.body,
      authorId: fields.authorId,
    },
  }));
}

async function update(id, patch) {
  const postId = numericId(id);
  if (postId === null) return null;
  const data = {};
  if (patch.title !== undefined) data.title = patch.title;
  if (patch.body !== undefined) data.body = patch.body;

  return withSafeErrors(async () => {
    try {
      return await prisma.post.update({ where: { id: postId }, data });
    } catch (error) {
      if (error && error.code === 'P2025') return null;
      throw error;
    }
  });
}

async function remove(id) {
  const postId = numericId(id);
  if (postId === null) return false;

  return withSafeErrors(async () => {
    try {
      await prisma.post.delete({ where: { id: postId } });
      return true;
    } catch (error) {
      if (error && error.code === 'P2025') return false;
      throw error;
    }
  });
}

module.exports = { findAll, findById, create, update, remove };
