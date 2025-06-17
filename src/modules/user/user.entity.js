const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../../config/database');
const { RolesEnum, Roles } = require('../../constants/enums/roles');

class User extends Model {
  // Instance method to check password
  async isPasswordMatch(password) {
    return bcrypt.compare(password, this.password);
  }

  // Static method to check if email is taken
  static async isEmailTaken(email, excludeUserId) {
    const user = await User.findOne({
      where: {
        email: email.toLowerCase(),
        id: excludeUserId ? { [Sequelize.Op.ne]: excludeUserId } : undefined,
      },
    });
    return !!user;
  }
}

// Define the User model schema
User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    account_number: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      set(value) {
        this.setDataValue('email', value.toLowerCase());
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM(RolesEnum),
      defaultValue: Roles.CUSTOMER,
    },
    accessToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async user => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 8);
        }
      },
      beforeUpdate: async user => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 8);
        }
      },
    },
  },
);

module.exports = User;
