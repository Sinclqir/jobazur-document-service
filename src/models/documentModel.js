module.exports = (sequelize, DataTypes) => {
  const Document = sequelize.define('Document', {
    id: { 
      type: DataTypes.UUID, 
      primaryKey: true, 
      defaultValue: DataTypes.UUIDV4 
    },
    title: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    fileUrl: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    type: { 
      type: DataTypes.STRING, 
      allowNull: false,
      defaultValue: 'cv'
    },
    uploadedAt: { 
      type: DataTypes.DATE, 
      defaultValue: DataTypes.NOW 
    },
    userId: { 
      type: DataTypes.UUID, 
      allowNull: false 
    }
  }, {
    tableName: 'documents',
    timestamps: false,
  });

  return Document;
}; 