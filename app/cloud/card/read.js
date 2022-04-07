Moralis.Cloud.define("getTask", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  try {
    if (request.params.taskId) {
      var task = await getTaskObjByTaskId(request.params.taskId);
      logger.info(`getTask: ${JSON.stringify(task)}`);
      if (!task) throw `Task ${request.params.taskId} not found`;

      // Get space to check if user can view it
      const space = await getBoardObjByObjectId(task.boardId, request.user?.id);
      const canReadSpace = canRead(space[0], request.user?.id);
      if (!canReadSpace) throw "You dont have access to view this space";

      // Get access level of caller
      const access = getCardAccess(task, request.user?.id);
      task.access = access;
      logger.info(`access ${JSON.stringify(access)}`);

      // Get proposals that can be viewed by user
      task.numProposals = task.proposals?.length;
      task.proposals = getViewableProposals(
        task.proposals,
        task.access,
        request.user?.id
      );

      logger.info(`Viewable proposals ${JSON.stringify(task.proposals)}`);

      return task;
    }
  } catch (err) {
    logger.error(
      `Error while getting task from board ${request.params.taskId}: ${err}`
    );
    throw err;
  }
});

function getViewableProposals(proposals, taskAccess, callerId) {
  if (!proposals) return [];
  if (!(taskAccess.creator || taskAccess.reviewer)) {
    return proposals.filter((proposal) => {
      return proposal.userId === callerId;
    });
  } else {
    return proposals;
  }
}