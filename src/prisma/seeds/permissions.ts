import prisma from '@/db'

const permissionsSeed = async () => {
  try {
    const permissions = [
      { name: 'view:dashboard', description: 'View the dashboard' },
      { name: 'read:user', description: 'View User' },
      { name: 'create:user', description: 'Create User' },
      { name: 'delete:user', description: 'Delete a user' },
      { name: 'update:user', description: 'Update User' },
      { name: 'read:role', description: 'Read Role' },
      { name: 'create:location', description: 'Location Created' },
      { name: 'delete:location', description: 'Delete Location' },
      { name: 'update:location', description: 'Update Location' },
      { name: 'read:location', description: 'Read Location' },
      { name: 'create:customer', description: 'Create Customer' },
      { name: 'read:customer', description: 'Read Customer' },
      { name: 'update:customer', description: 'Update Customer' },
      { name: 'delete:customer', description: 'Delete Customer' },
      { name: 'create:company', description: 'Create Company' },
      { name: 'read:company', description: 'Read Company' },
      { name: 'update:company', description: 'Update Company' },
      { name: 'delete:company', description: 'Delete Company' },
      { name: 'create:product', description: 'Create Product' },
      { name: 'read:product', description: 'Read Product' },
      { name: 'update:product', description: 'Update Product' },
      { name: 'delete:product', description: 'Delete Product' },
      { name: 'create:category', description: 'Create Category' },
      { name: 'read:category', description: 'Read Category' },
      { name: 'update:category', description: 'Update Category' },
      { name: 'delete:category', description: 'Delete Category' },
      { name: 'create:companyType', description: 'Create Company Type' },
      { name: 'read:companyType', description: 'Read CompanyType' },
      { name: 'update:companyType', description: 'Update Company Type' },
      { name: 'delete:companyType', description: 'Delete Company Type' }
    ]

    for (const permission of permissions) {
      await prisma.permission.upsert({
        where: { name: permission.name },
        update: { description: permission.description },
        create: permission
      })
    }

    console.info('Permissions seeded')
  } catch (error) {
    console.error('Error seeding permissions:', error)
    throw error
  }
}

export default permissionsSeed
