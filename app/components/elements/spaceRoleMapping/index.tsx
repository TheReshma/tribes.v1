import { Close } from "@mui/icons-material";
import {
  Autocomplete,
  Box,
  Grow,
  IconButton,
  Modal,
  styled,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { AnyStyledComponent } from "styled-components";
import { useSpace } from "../../../../pages/tribe/[id]/space/[bid]";
import { useMoralisFunction } from "../../../hooks/useMoralisFunction";
import { ModalHeading, PrimaryButton } from "../styledComponents";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
};

type Role = {
  id: string;
  name: string;
};
const SpaceRoleMapping = ({ isOpen, handleClose }: Props) => {
  const { space, setSpace } = useSpace();
  const [roles, setRoles] = useState<Role[]>([]);
  const { runMoralisFunction } = useMoralisFunction();

  const [stewardRoles, setStewardRoles] = useState<Role[]>([]);
  const [contributorRoles, setContributorRoles] = useState<Role[]>([]);
  const [memberRoles, setMemberRoles] = useState<Role[]>([]);
  const getGuildRoles = async () => {
    const res = await fetch(
      `http://localhost:3001/api/test?guildId=${space.guildId}`,
      {
        method: "GET",
      }
    );
    const data = await res.json();
    setRoles(data.roles);
    console.log(data.roles);
  };
  useEffect(() => {
    getGuildRoles();
  }, []);

  return (
    <Modal open={isOpen} onClose={handleClose} closeAfterTransition>
      <Grow in={isOpen} timeout={500}>
        <ModalContainer>
          <ModalHeading>
            <Typography sx={{ color: "#99ccff" }}>Member Roles</Typography>
            <Box sx={{ flex: "1 1 auto" }} />
            <IconButton sx={{ m: 0, p: 0.5 }} onClick={handleClose}>
              <Close />
            </IconButton>
          </ModalHeading>
          <ModalContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 8 }}>
              <Typography color="secondary" sx={{ mr: 8, width: "30%" }}>
                Steward
              </Typography>
              <Autocomplete
                options={roles}
                multiple
                getOptionLabel={(option) => option.name}
                value={stewardRoles}
                disableClearable
                onChange={(event, newValue) => {
                  setStewardRoles(newValue as Role[]);
                }}
                fullWidth
                size="small"
                renderInput={(params) => (
                  <TextField {...params} size="small" color="secondary" />
                )}
                sx={{ mr: 2 }}
              />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 8 }}>
              <Typography color="secondary" sx={{ mr: 8, width: "30%" }}>
                Contributor
              </Typography>
              <Autocomplete
                options={roles}
                multiple
                getOptionLabel={(option) => option.name}
                value={contributorRoles}
                disableClearable
                onChange={(event, newValue) => {
                  setContributorRoles(newValue as Role[]);
                }}
                fullWidth
                size="small"
                renderInput={(params) => (
                  <TextField {...params} size="small" color="secondary" />
                )}
                sx={{ mr: 2 }}
              />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 8 }}>
              <Typography color="secondary" sx={{ mr: 8, width: "30%" }}>
                Member
              </Typography>
              <Autocomplete
                options={roles}
                multiple
                getOptionLabel={(option) => option.name}
                value={memberRoles}
                disableClearable
                onChange={(event, newValue) => {
                  setMemberRoles(newValue as Role[]);
                }}
                fullWidth
                size="small"
                renderInput={(params) => (
                  <TextField {...params} size="small" color="secondary" />
                )}
                sx={{ mr: 2 }}
              />
            </Box>
            <PrimaryButton
              variant="outlined"
              color="secondary"
              sx={{ borderRadius: 1 }}
              fullWidth
              onClick={() => {
                let newRoles: any = {};
                stewardRoles.forEach((role) => {
                  newRoles[role.id as any] = {
                    id: role.id,
                    name: role.name,
                  };
                });
                contributorRoles.forEach((role) => {
                  newRoles[role.id as any] = {
                    id: role.id,
                    name: role.name,
                  };
                });
                memberRoles.forEach((role) => {
                  newRoles[role.id as any] = {
                    id: role.id,
                    name: role.name,
                  };
                });
                console.log(newRoles);
                runMoralisFunction("setSpaceRoleMapping", {
                  roleMapping: newRoles,
                  objectId: space.objectId,
                }).then((res) => {
                  console.log(res);
                });
              }}
            >
              Set Roles
            </PrimaryButton>
          </ModalContent>
        </ModalContainer>
      </Grow>
    </Modal>
  );
};

// @ts-ignore
const ModalContainer = styled(Box)(({ theme }) => ({
  position: "absolute" as "absolute",
  top: "10%",
  left: "25%",
  transform: "translate(-50%, -50%)",
  width: "35rem",
  border: "2px solid #000",
  backgroundColor: theme.palette.background.default,
  boxShadow: 24,
  overflow: "auto",
  maxHeight: "calc(100% - 128px)",
}));

const ModalContent = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: 32,
}));

export default SpaceRoleMapping;
