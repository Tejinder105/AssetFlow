import { prisma } from '../db/index.js';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';



async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean the database in reverse order of dependencies to avoid foreign key constraints
  console.log('🧹 Cleaning existing data...');
  await prisma.session.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.discrepancyReport.deleteMany();
  await prisma.auditItem.deleteMany();
  await prisma.auditCycleAuditor.deleteMany();
  await prisma.auditCycle.deleteMany();
  await prisma.maintenanceRequest.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.transferRequest.deleteMany();
  await prisma.allocation.deleteMany();
  await prisma.assetStatusLog.deleteMany();
  await prisma.assetAttachment.deleteMany();
  await prisma.assetCustomFieldValue.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.categoryField.deleteMany();
  await prisma.assetCategory.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Departments
  console.log('🏢 Seeding Departments...');
  const departmentsData = [
    { name: 'Engineering', status: 'Active' },
    { name: 'Human Resources', status: 'Active' },
    { name: 'Finance', status: 'Active' },
    { name: 'IT Support', status: 'Active' },
    { name: 'Marketing', status: 'Active' },
  ];

  const createdDepartments = [];
  for (const dept of departmentsData) {
    createdDepartments.push(await prisma.department.create({ data: dept }));
  }

  // 2. Users
  console.log('👥 Seeding Users...');
  const roles = ['Admin', 'AssetManager', 'DepartmentHead', 'Employee'];
  const users = [];

  // Create one Admin explicitly
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@assetflow.com',
      passwordHash,
      role: 'Admin',
      status: 'Active',
      departmentId: createdDepartments[3].departmentId, // IT Support
    },
  });
  users.push(adminUser);

  // Create more users
  for (let i = 0; i < 20; i++) {
    const role = faker.helpers.arrayElement(roles);
    const department = faker.helpers.arrayElement(createdDepartments);
    const user = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        passwordHash,
        role,
        status: faker.helpers.weightedArrayElement([{ weight: 9, value: 'Active' }, { weight: 1, value: 'Inactive' }]),
        departmentId: department.departmentId,
      },
    });
    users.push(user);
  }

  // Assign department heads
  for (const dept of createdDepartments) {
    const deptUsers = users.filter((u) => u.departmentId === dept.departmentId && u.role === 'DepartmentHead');
    if (deptUsers.length > 0) {
      await prisma.department.update({
        where: { departmentId: dept.departmentId },
        data: { headUserId: deptUsers[0].userId },
      });
    }
  }

  // 3. Asset Categories & Fields
  console.log('📦 Seeding Asset Categories and Fields...');
  const categoriesData = [
    {
      name: 'Laptops',
      description: 'Company issued laptops',
      fields: [
        { fieldName: 'RAM', fieldType: 'number', isRequired: true },
        { fieldName: 'Storage', fieldType: 'text', isRequired: true },
        { fieldName: 'Processor', fieldType: 'text', isRequired: true },
      ],
    },
    {
      name: 'Monitors',
      description: 'External monitors',
      fields: [
        { fieldName: 'Resolution', fieldType: 'text', isRequired: true },
        { fieldName: 'Screen Size', fieldType: 'number', isRequired: true },
      ],
    },
    {
      name: 'Office Furniture',
      description: 'Desks, chairs, etc.',
      fields: [
        { fieldName: 'Color', fieldType: 'text', isRequired: false },
        { fieldName: 'Material', fieldType: 'text', isRequired: false },
      ],
    },
    {
      name: 'Mobile Devices',
      description: 'Smartphones and tablets',
      fields: [
        { fieldName: 'OS', fieldType: 'text', isRequired: true },
        { fieldName: 'IMEI', fieldType: 'text', isRequired: false },
      ],
    },
  ];

  const categories = [];
  const allCategoryFields = [];

  for (const cat of categoriesData) {
    const category = await prisma.assetCategory.create({
      data: {
        name: cat.name,
        description: cat.description,
        fields: {
          create: cat.fields.map(f => ({
            fieldName: f.fieldName,
            fieldType: f.fieldType,
            isRequired: f.isRequired,
          }))
        }
      },
      include: { fields: true },
    });
    categories.push(category);
    allCategoryFields.push(...category.fields);
  }

  // 4. Assets
  console.log('💻 Seeding Assets...');
  const assets = [];
  const assetConditions = ['New', 'Good', 'Fair', 'Poor', 'Damaged'];
  const assetStatuses = ['Available', 'Allocated', 'Reserved', 'UnderMaintenance', 'Lost', 'Retired', 'Disposed'];

  for (let i = 0; i < 100; i++) {
    const category = faker.helpers.arrayElement(categories);
    const creator = faker.helpers.arrayElement(users.filter(u => ['Admin', 'AssetManager'].includes(u.role))) || adminUser;
    
    // Some assets are allocated
    const isAllocated = Math.random() > 0.5;
    const status = isAllocated ? 'Allocated' : faker.helpers.arrayElement(['Available', 'UnderMaintenance', 'Reserved']);
    let holderUserId = null;
    let holderDepartmentId = null;

    if (status === 'Allocated') {
      if (Math.random() > 0.3) {
        holderUserId = faker.helpers.arrayElement(users).userId;
      } else {
        holderDepartmentId = faker.helpers.arrayElement(createdDepartments).departmentId;
      }
    }

    const asset = await prisma.asset.create({
      data: {
        assetTag: `AST-${1000 + i}`,
        name: `${faker.company.name()} ${category.name.substring(0, 3)}`,
        categoryId: category.categoryId,
        serialNumber: faker.string.alphanumeric(12).toUpperCase(),
        acquisitionDate: faker.date.past({ years: 3 }),
        acquisitionCost: faker.number.float({ min: 100, max: 3000, fractionDigits: 2 }),
        condition: faker.helpers.arrayElement(assetConditions),
        location: faker.location.buildingNumber() + ' ' + faker.location.street(),
        isBookable: category.name !== 'Laptops' && Math.random() > 0.5,
        status: status,
        currentHolderUserId: holderUserId,
        currentHolderDepartmentId: holderDepartmentId,
        createdBy: creator.userId,
      },
    });
    assets.push({ ...asset, category });

    // Custom Field Values for Asset
    for (const field of category.fields) {
      let fieldValue = '';
      if (field.fieldType === 'number') {
        fieldValue = faker.number.int({ min: 4, max: 64 }).toString();
      } else if (field.fieldType === 'text') {
        fieldValue = faker.word.noun();
      }

      await prisma.assetCustomFieldValue.create({
        data: {
          assetId: asset.assetId,
          fieldId: field.fieldId,
          fieldValue: fieldValue,
        },
      });
    }

    // Asset Status Logs
    await prisma.assetStatusLog.create({
      data: {
        assetId: asset.assetId,
        fromStatus: null,
        toStatus: status,
        changedBy: creator.userId,
        reason: 'Initial status on creation',
      },
    });

    // Allocations if applicable
    if (status === 'Allocated') {
      await prisma.allocation.create({
        data: {
          assetId: asset.assetId,
          allocatedToUserId: holderUserId,
          allocatedToDepartmentId: holderDepartmentId,
          allocatedBy: creator.userId,
          allocationDate: faker.date.recent({ days: 30 }),
          expectedReturnDate: Math.random() > 0.5 ? faker.date.future({ years: 1 }) : null,
          status: 'Active',
        },
      });
    }
  }

  // 5. Bookings
  console.log('📅 Seeding Bookings...');
  const bookableAssets = assets.filter(a => a.isBookable);
  for (let i = 0; i < 20; i++) {
    if (bookableAssets.length === 0) break;
    const asset = faker.helpers.arrayElement(bookableAssets);
    const user = faker.helpers.arrayElement(users);
    
    const startTime = faker.date.soon({ days: 10 });
    const endTime = new Date(startTime.getTime() + faker.number.int({ min: 1, max: 8 }) * 60 * 60 * 1000); // 1-8 hours later

    await prisma.booking.create({
      data: {
        assetId: asset.assetId,
        bookedByUserId: user.userId,
        startTime,
        endTime,
        status: faker.helpers.arrayElement(['Upcoming', 'Ongoing', 'Completed', 'Cancelled']),
      },
    });
  }

  // 6. Maintenance Requests
  console.log('🔧 Seeding Maintenance Requests...');
  for (let i = 0; i < 15; i++) {
    const asset = faker.helpers.arrayElement(assets);
    const user = faker.helpers.arrayElement(users);
    const status = faker.helpers.arrayElement(['Pending', 'Approved', 'InProgress', 'Resolved', 'Rejected']);
    
    await prisma.maintenanceRequest.create({
      data: {
        assetId: asset.assetId,
        raisedBy: user.userId,
        issueDescription: faker.lorem.paragraph(),
        priority: faker.helpers.arrayElement(['Low', 'Medium', 'High', 'Critical']),
        status,
        ...(status === 'Resolved' && {
          resolvedAt: faker.date.recent({ days: 5 }),
          resolutionNotes: faker.lorem.sentence(),
          technicianName: faker.person.fullName(),
        }),
      },
    });
  }

  // 7. Audit Cycles
  console.log('📋 Seeding Audit Cycles...');
  for (let i = 0; i < 3; i++) {
    const creator = faker.helpers.arrayElement(users.filter(u => ['Admin', 'AssetManager'].includes(u.role))) || adminUser;
    
    const startDate = faker.date.recent({ days: 10 });
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days later

    const auditCycle = await prisma.auditCycle.create({
      data: {
        name: `Q${faker.number.int({ min: 1, max: 4 })} Asset Audit ${faker.date.past().getFullYear()}`,
        startDate,
        endDate,
        status: faker.helpers.arrayElement(['Planned', 'Ongoing', 'Closed']),
        createdBy: creator.userId,
        scopeDepartmentId: faker.helpers.arrayElement(createdDepartments).departmentId,
      },
    });

    // Add Auditors
    const auditor1 = faker.helpers.arrayElement(users);
    const auditor2 = faker.helpers.arrayElement(users.filter(u => u.userId !== auditor1.userId));
    
    await prisma.auditCycleAuditor.createMany({
      data: [
        { auditCycleId: auditCycle.auditCycleId, auditorUserId: auditor1.userId },
        ...(auditor2 ? [{ auditCycleId: auditCycle.auditCycleId, auditorUserId: auditor2.userId }] : [])
      ],
      skipDuplicates: true,
    });

    // Add Audit Items
    const itemsToAudit = faker.helpers.arrayElements(assets, 10);
    for (const asset of itemsToAudit) {
      const verificationStatus = faker.helpers.arrayElement(['Pending', 'Verified', 'Missing', 'Damaged']);
      
      const auditItem = await prisma.auditItem.create({
        data: {
          auditCycleId: auditCycle.auditCycleId,
          assetId: asset.assetId,
          verificationStatus,
          verifiedBy: verificationStatus !== 'Pending' ? auditor1.userId : null,
          verifiedAt: verificationStatus !== 'Pending' ? faker.date.recent() : null,
        },
      });

      if (['Missing', 'Damaged'].includes(verificationStatus)) {
        await prisma.discrepancyReport.create({
          data: {
            auditItemId: auditItem.auditItemId,
            discrepancyType: verificationStatus,
            description: faker.lorem.sentence(),
            resolutionStatus: 'Open',
          },
        });
      }
    }
  }

  // 8. Notifications & Activity Logs
  console.log('🔔 Seeding Notifications & Activity Logs...');
  for (let i = 0; i < 50; i++) {
    const user = faker.helpers.arrayElement(users);
    
    await prisma.notification.create({
      data: {
        userId: user.userId,
        type: faker.helpers.arrayElement(['ASSET_ASSIGNED', 'MAINTENANCE_UPDATE', 'AUDIT_REMINDER']),
        title: faker.lorem.words(3),
        message: faker.lorem.sentence(),
        isRead: faker.datatype.boolean(),
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.userId,
        action: faker.helpers.arrayElement(['USER_LOGIN', 'ASSET_CREATED', 'ASSET_UPDATED', 'REPORT_GENERATED']),
        ipAddress: faker.internet.ipv4(),
      },
    });
  }

  console.log('✅ Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
