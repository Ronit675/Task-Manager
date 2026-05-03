import mongoose from 'mongoose'

const cleanupLegacyUserIndexes = async () => {
  const usersCollection = mongoose.connection.db.collection('users')
  const indexes = await usersCollection.indexes()
  const hasLegacyUsernameIndex = indexes.some((index) => index.name === 'username_1')

  if (!hasLegacyUsernameIndex) {
    return
  }

  await usersCollection.dropIndex('username_1')
  console.log('Dropped legacy users index: username_1')
}

const connectDatabase = async (mongoUri) => {
  if (!mongoUri) {
    throw new Error('MONGODB_URI is required')
  }

  mongoose.set('strictQuery', true)
  await mongoose.connect(mongoUri)

  try {
    await cleanupLegacyUserIndexes()
  } catch (error) {
    // Ignore if users collection does not exist yet; rethrow unexpected errors.
    if (error?.codeName !== 'NamespaceNotFound') {
      throw error
    }
  }
}

export default connectDatabase
