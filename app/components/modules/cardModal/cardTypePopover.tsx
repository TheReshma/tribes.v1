import styled from "@emotion/styled";
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
  task: Task;
};

const CardTypePopover = ({ task }: Props) => {
  const [type, setType] = useState("Bounty");
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
    setType(task?.type);
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
          Type
        </Typography>
        <CardButton
          variant="contained"
          onClick={handleClick()}
          sx={{
            backgroundColor: "#2e2f59",
            padding: "6px",
            maxWidth: "8rem",
          }}
        >
          <Typography
            sx={{
              fontSize: 14,
              maxWidth: "6rem",
              minWidth: "3rem",
              minHeight: "1.3rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontWeight: "100",
            }}
          >
            {type}
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
            options={["Task", "Bounty"]} // Get options from members
            value={type as any}
            //getOptionLabel={(option) => space.memberDetails[option].username}
            onChange={(event, newValue) => {
              setType(newValue as string);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                id="filled-hidden-label-normal"
                size="small"
                fullWidth
                placeholder="Search types"
              />
            )}
          />
          <PrimaryButton
            variant="outlined"
            color="secondary"
            sx={{ mt: 4, borderRadius: 1 }}
            loading={isLoading}
            onClick={() => {}}
          >
            Save
          </PrimaryButton>
        </PopoverContainer>
      </Popover>
    </>
  );
};

export default CardTypePopover;