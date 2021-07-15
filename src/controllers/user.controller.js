const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { bochkUMSService } = require('../services');
const { userFactory } = require('../factories');

const getAccountInfo = catchAsync(async (req, res) => {
  const userInfoString = await bochkUMSService.getUserInfo(req.user);
  if (userInfoString === '') {
    throw new ApiError(httpStatus.NOT_FOUND, 'No response from BOCHK UMS');
  }
  const userInfoData = userFactory.fromBOCHKUMSUserInfoAPI(userInfoString);
  res.send(userInfoData);
});

module.exports = {
  getAccountInfo,
};
