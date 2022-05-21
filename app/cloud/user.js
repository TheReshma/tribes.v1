async function getCreatedUser(userInfo, userId, ethAddress) {
  userInfo.set('userId', userId);
  userInfo.set('tribes', []);
  userInfo.set('ethAddress', ethAddress);
  return userInfo;
}

async function getUpdatedUser(userInfo, tribes) {
  userInfo.set('tribes', tribes);
  return userInfo;
}

async function getUserByEthAddress(ethAddress) {
  const userInfoQuery = new Moralis.Query('UserInfo');
  userInfoQuery.equalTo('ethAddress', ethAddress);
  return await userInfoQuery.first({ useMasterKey: true });
}

async function getUserByUserId(userId) {
  const userInfoQuery = new Moralis.Query('UserInfo');
  userInfoQuery.equalTo('userId', userId);
  return await userInfoQuery.first({ useMasterKey: true });
}

async function getUserByUsername(username) {
  const userInfoQuery = new Moralis.Query('UserInfo');
  userInfoQuery.equalTo('username', username);
  return await userInfoQuery.first({ useMasterKey: true });
}

async function getUserByObjId(objectId) {
  const userInfoQuery = new Moralis.Query('UserInfo');
  userInfoQuery.equalTo('objectId', objectId);
  return await userInfoQuery.first({ useMasterKey: true });
}

async function getUserDetailsByUserIds(userIds) {
  const userQuery = new Moralis.Query('User');
  const pipeline = [
    { match: { objectId: { $in: userIds } } },
    {
      project: {
        objectId: 1,
        username: 1,
        avatar: 1,
        ethAddress: 1,
        discordId: 1,
        profilePicture: 1,
      },
    },
  ];
  return await userQuery.aggregate(pipeline, { useMasterKey: true });
}

async function getUserIdToUserDetailsMapByUserIds(userIds) {
  const userDetails = await getUserDetailsByUserIds(userIds);
  var userDetailsMap = {};
  for (var userDetail of userDetails)
    userDetailsMap[userDetail.objectId] = userDetail;
  return userDetailsMap;
}

async function getUsernameProfilePicByUserId(userId) {
  const userQuery = new Moralis.Query('User');
  const pipeline = [
    { match: { objectId: userId } },
    {
      project: {
        objectId: 1,
        username: 1,
        profilePicture: 1,
        ethAddress: 1,
      },
    },
  ];
  const user = await userQuery.aggregate(pipeline, { useMasterKey: true });
  if (user) return user[0];
  else return null;
}

async function getUserCount() {
  const userQuery = new Moralis.Query('User');
  return await userQuery.count({ useMasterKey: true });
}

async function getUserCountWithUsername(username) {
  const userQuery = new Moralis.Query('User');
  userQuery.equalTo('username', username);
  return await userQuery.count({ useMasterKey: true });
}

function getAllAssociatedUsersIds(board, tasks, epochs) {
  const boardMembers = board.members;
  var taskMembers = [];
  for (var task of tasks) {
    taskMembers = taskMembers.concat(task.assignee).concat(task.reviewer);
    taskMembers.push(task.creator);
    if (task.proposals) {
      for (var proposal of task.proposals) {
        taskMembers.push(proposal.userId);
      }
    }
  }

  var epochMembers = [];
  for (var epoch of epochs) {
    epochMembers = epochMembers.concat(Object.keys(epoch.memberStats));
    if (epoch.type === 'Member') {
      epochMembers = epochMembers.concat(epoch.choices);
    }
  }
  var uniqueUserIds = boardMembers
    .concat(taskMembers)
    .concat(epochMembers)
    .filter(onlyUnique);

  return uniqueUserIds;
}

Moralis.Cloud.define('getUserCount', async (request) => {
  return await getUserCount();
});

Moralis.Cloud.define('getOrCreateUser', async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    var userInfo = await getUserByUserId(request.user.id);
    if (!userInfo) {
      var userCount = await getUserCount();
      userInfo = new Moralis.Object('UserInfo');
      userInfo = await getCreatedUser(
        userInfo,
        request.user.id,
        request.user.get('ethAddress')
      );
      request.user.set('username', `fren${userCount}`);

      await Moralis.Object.saveAll([userInfo, request.user], {
        useMasterKey: true,
      });
    }
    return request.user;
  } catch (err) {
    logger.error(`Error while gettig user ${err}`);
    return false;
  }
});

async function getUserDetailsWithUsername(username) {
  const userQuery = new Moralis.Query('User');
  const pipeline = [
    { match: { username: username } },
    {
      project: {
        objectId: 1,
        username: 1,
        profilePicture: 1,
        ethAddress: 1,
      },
    },
  ];
  const user = await userQuery.aggregate(pipeline, { useMasterKey: true });
  if (user) return user[0];
  else return null;
}

async function getRelevantCards(userId) {
  const cardQuery = new Moralis.Query('Task');
  const cards = await cardQuery.aggregate([], { useMasterKey: true });
  let res = [];
  for (var card of cards) {
    if (card.assignee?.includes(userId)) {
      res.push(card);
    }
  }
  return res;
}

Moralis.Cloud.define('getUserDetailsWithUsername', async (request) => {
  const user = await getUserDetailsWithUsername(request.params.username);
  user.cards = await getRelevantCards(user.objectId);
  return user;
});
