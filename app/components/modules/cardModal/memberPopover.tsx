import {
  Autocomplete,
  Popover,
  TextField,
  Typography,
  Box,
  Avatar,
} from "@mui/material";
import { type } from "os";
import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { updateTaskMember } from "../../../adapters/moralis";
import { BoardData, Task } from "../../../types";
import { PrimaryButton, CardButton } from "../../elements/styledComponents";
import { PopoverContainer } from "./styles";
import { useSpace } from "../../../../pages/tribe/[id]/space/[bid]";
import { notify } from "../settingsTab";
import PersonIcon from "@mui/icons-material/Person";

type Props = {
  type: string;
  task: Task;
};

const MemberPopover = ({ type, task }: Props) => {
  const [member, setMember] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { Moralis } = useMoralis();
  const { space, setSpace } = useSpace();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);

  const handleClick = () => (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (type === "reviewer") {
      setMember(task.reviewer[0]);
    } else {
      setMember(task.assignee[0]);
    }
  }, [task]);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          mt: 2,
          mx: 1,
        }}
      >
        <Typography
          sx={{ fontSize: 12, color: "text.secondary", width: "100%" }}
        >
          {type === "reviewer" ? "Reviewer" : "Assignee"}
        </Typography>
        <CardButton
          variant="outlined"
          onClick={handleClick()}
          color="secondary"
          sx={{
            padding: "6px",
            minWidth: "3rem",
          }}
        >
          <Avatar
            variant="rounded"
            sx={{
              p: 0,
              mr: 2,
              width: 20,
              height: 20,
              backgroundColor: "transparent",
            }}
            src={
              type === "reviewer"
                ? space.memberDetails[task.reviewer[0]]?.profilePicture?._url
                : space.memberDetails[task.assignee[0]]?.profilePicture?._url
            }
          >
            <PersonIcon sx={{ color: "text.primary" }} />
          </Avatar>
          <Typography
            sx={{
              fontSize: 14,
              minWidth: "3rem",
            }}
          >
            {type === "reviewer"
              ? space.memberDetails[task.reviewer[0]]?.username ||
                "Add reviewer"
              : space.memberDetails[task.assignee[0]]?.username || "Unassigned"}
          </Typography>
        </CardButton>
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => handleClose()}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <PopoverContainer>
          <Autocomplete
            options={space.members} // Get options from members
            value={member as any}
            getOptionLabel={(option) => space.memberDetails[option].username}
            onChange={(event, newValue) => {
              setMember(newValue as string);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                id="filled-hidden-label-normal"
                size="small"
                fullWidth
                placeholder="Search member"
              />
            )}
          />
          <PrimaryButton
            variant="outlined"
            color="secondary"
            sx={{ mt: 4, borderRadius: 1 }}
            loading={isLoading}
            onClick={() => {
              setIsLoading(true);
              // we store array of assignee and reviewer to be able to handle multiple assignees and reviewers later
              updateTaskMember(Moralis, member, type, task.taskId)
                .then((res: BoardData) => {
                  setSpace(res);
                  setIsLoading(false);
                  handleClose();
                })
                .catch((err: any) => {
                  notify(
                    `Sorry! There was an error while updating ${type}.`,
                    "error"
                  );
                });
            }}
          >
            Save
          </PrimaryButton>
        </PopoverContainer>
      </Popover>
    </>
  );
};

export default MemberPopover;
