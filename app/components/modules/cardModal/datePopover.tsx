import { DateTimePicker, LocalizationProvider } from "@mui/lab";
import { Popover, TextField, Box, Avatar, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { PrimaryButton, CardButton } from "../../elements/styledComponents";
import { BoardData, Task } from "../../../types";
import { updateTaskDeadline } from "../../../adapters/moralis";
import { useMoralis } from "react-moralis";
import { useSpace } from "../../../../pages/tribe/[id]/space/[bid]";
import DateRangeIcon from "@mui/icons-material/DateRange";
import { actionMap, monthMap } from "../../../constants";
import { formatTime, getMD5String } from "../../../utils/utils";
import PaidIcon from "@mui/icons-material/Paid";
import { PopoverContainer } from "./styles";
import { notify } from "../settingsTab";
import { useMoralisFunction } from "../../../hooks/useMoralisFunction";

type Props = {
  task: Task;
  setTask: (task: Task) => void;
};

function toLocalDate(date: Date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
}

const DatePopover = ({ task, setTask }: Props) => {
  const [date, setDate] = useState("");
  const [open, setOpen] = useState(false);
  const { space, setSpace } = useSpace();
  const { Moralis } = useMoralis();
  const [isLoading, setIsLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const { runMoralisFunction } = useMoralisFunction();

  const handleClick = () => (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = () => {
    const prevTask = Object.assign({}, task);
    const temp = Object.assign({}, task);
    temp.deadline = new Date(date);
    setTask(temp);
    handleClose();
    runMoralisFunction("updateCard", {
      updates: {
        deadline: new Date(date).toUTCString(),
        taskId: task.taskId,
      },
    })
      .then((res) => {
        console.log(res);
        setSpace(res);
      })
      .catch((err: any) => {
        setTask(prevTask);
        notify(`${err.message}`, "error");
      });
  };

  useEffect(() => {
    if (task.deadline) {
      const offset = task.deadline.getTimezoneOffset();
      const deadline = new Date(task.deadline.getTime() - offset * 60 * 1000);
      setDate(deadline.toISOString().slice(0, -8));
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
          Due Date
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
              p: 0.1,
              mr: 2,
              width: 20,
              height: 20,
              backgroundColor: "transparent",
            }}
          >
            <DateRangeIcon sx={{ color: "text.primary" }} />
          </Avatar>
          <Typography
            sx={{
              fontSize: 14,
            }}
          >
            {task.deadline ? (
              <Typography sx={{ fontSize: 14 }} color="text.primary">
                {task.deadline?.getDate()}{" "}
                {monthMap[task.deadline?.getMonth() as keyof typeof monthMap]}{" "}
                {task.deadline && formatTime(task.deadline)}
              </Typography>
            ) : (
              <Typography sx={{ fontSize: 14 }} color="text.primary">
                Set due date
              </Typography>
            )}
          </Typography>
        </CardButton>
      </Box>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => {
          handleClose();
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <PopoverContainer>
          <TextField
            id="datetime-local"
            label="Due Date"
            type="datetime-local"
            InputLabelProps={{
              shrink: true,
            }}
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
            }}
            fullWidth
          />
          <PrimaryButton
            variant="outlined"
            sx={{ mt: 4, borderRadius: 1 }}
            loading={isLoading}
            color="secondary"
            onClick={handleSave}
          >
            Save
          </PrimaryButton>
        </PopoverContainer>
      </Popover>
    </>
  );
};
export default DatePopover;