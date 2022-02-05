import {
  Avatar,
  Button,
  ButtonProps,
  Fade,
  styled,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { Box, width } from "@mui/system";
import Link from "next/link";
import React from "react";
import { useTribe } from "../../../../pages/tribe/[id]";
import GitHubIcon from "@mui/icons-material/GitHub";
import EpochModal, { PrimaryButton } from "../epochModal";

const HeadingAvatar = styled(Avatar)(({ theme }) => ({
  width: "6rem",
  height: "6rem",
  objectFit: "cover",
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: "none",
  fontSize: "1.2rem",
  marginRight: 25,
}));

const StyledAnchor = styled("a")(({ theme }) => ({
  color: "#5a6972",
  marginRight: "1.5rem",
}));

type Props = {};

const TribeHeading = (props: Props) => {
  const { setTab, tab } = useTribe();
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };
  return (
    <div>
      <Box
        sx={{ display: "flex", flexDirection: "row", width: "100%", margin: 1 }}
      >
        <Box
          sx={{ display: "flex", flexDirection: "row", width: "100%", pt: 4 }}
        >
          <Box sx={{ mr: 1 }}>
            <Link href={`/profile/`} passHref>
              <HeadingAvatar alt="Username" />
            </Link>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              marginLeft: 4,
              width: "100%",
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "row", width: "100%" }}>
              <Typography variant="h4">Spect Network DAO</Typography>
              <EpochModal step={0} />
              <EpochModal step={1} />
              <PrimaryButton
                variant="outlined"
                size="large"
                type="submit"
                endIcon={<GitHubIcon />}
                onClick={() => {}}
                sx={{ ml: 3 }}
              >
                Integrate Github
              </PrimaryButton>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "row" }}>
              <StyledAnchor>
                <i className="fab fa-github" />
              </StyledAnchor>
              <StyledAnchor>
                <i className="fab fa-discord"></i>
              </StyledAnchor>
              <StyledAnchor>
                <i className="fab fa-twitter" />
              </StyledAnchor>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Tabs value={tab} onChange={handleChange}>
          <StyledTab label="Overview" value={0} />
          <StyledTab label="Contributors" value={1} />
          <StyledTab label="Board" value={2} />
          <StyledTab label="Settings" value={3} />
        </Tabs>
      </Box>
    </div>
  );
};

export default TribeHeading;
