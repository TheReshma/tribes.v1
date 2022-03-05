import styled from "@emotion/styled";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { PrimaryButton } from "../../elements/styledComponents";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import PaidIcon from "@mui/icons-material/Paid";
import { getEpochs, saveVotes, endEpoch } from "../../../adapters/moralis";
import { useMoralis } from "react-moralis";
import { useRouter } from "next/router";
import { Epoch } from "../../../types";
import { monthMap } from "../../../constants";
import { useBoard } from "../taskBoard";
import { downloadCSV } from "../../../utils/utils";

type Props = {
  expanded: boolean;
  handleChange: (
    panel: string
  ) => (event: React.SyntheticEvent, newExpanded: boolean) => void;
};

type VotesGivenOneEpoch = {
  [key: string]: number;
};

type VotesGivenAllEpochs = {
  [key: string]: VotesGivenOneEpoch;
};

type VotesRemaining = {
  [key: string]: number;
};

const EpochList = ({ expanded, handleChange }: Props) => {
  const { Moralis } = useMoralis();
  const router = useRouter();
  const { data, setData } = useBoard();
  const bid = router.query.bid as string;
  const [epochs, setEpochs] = useState([] as Epoch[]);
  const [votesGiven, setVotesGiven] = useState({} as VotesGivenAllEpochs);
  const [votesRemaining, setVotesRemaining] = useState({} as VotesRemaining);
  const [isLoading, setIsLoading] = useState(false);

  const handleVotesGiven = (
    epochid: string,
    memberId: string,
    value: number
  ) => {
    var temp = Object.assign({}, votesGiven); // Shallow copy
    temp[epochid][memberId] = value;
    setVotesGiven(temp);
  };

  const handleVotesRemaining = (
    epochid: string,
    memberId: string,
    newVoteVal: number
  ) => {
    var tempReceived = Object.assign({}, votesRemaining); // Shallow copy
    tempReceived[epochid] =
      tempReceived[epochid] -
      newVoteVal ** 2 +
      votesGiven[epochid][memberId] ** 2;
    setVotesRemaining(tempReceived);
  };

  const handleEpochUpdateAfterSave = (index: number, newEpoch: Epoch) => {
    var temp = epochs.filter(() => true); // Shallow copy
    temp[index] = newEpoch;
    setEpochs(temp);
  };

  const handleExport = (epoch: Epoch) => {
    if (epoch.type === "Contribution") {
      var rows = [
        ["username", "address", "allocation", "given", "received", "reward"],
      ];
      for (var choice of epoch.choices) {
        rows.push([
          data.memberDetails[choice].username,
          data.memberDetails[choice].ethAddress,
          epoch.memberStats[choice].votesAllocated,
          Object.values(epoch.memberStats[choice].votesGiven).reduce(
            (a, b) => (a as number) + (b as number)
          ),
          epoch.votes[choice],
          epoch.values[choice],
        ]);
      }
      downloadCSV(rows, `${epoch.name}_${epoch.type}_${epoch.startTime}`);
    } else if (epoch.type === "Task") {
      var rows = [
        [
          "id",
          "title",
          "description",
          "created by",
          "created on",
          "received",
          "reward",
        ],
      ];
      for (var choice of epoch.choices) {
        rows.push([
          choice,
          epoch.taskDetails[choice].title,
          epoch.taskDetails[choice].description,
          epoch.taskDetails[choice].creator,
          epoch.taskDetails[choice].createdAt,
          epoch.votes[choice],
          epoch.values[choice],
        ]);
      }
      downloadCSV(rows, `${epoch.name}_${epoch.type}_${epoch.startTime}`);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    getEpochs(Moralis, bid)
      .then((res: any) => {
        console.log(res);
        setEpochs(res);
        for (var epoch of res) {
          votesGiven[epoch.objectId] = epoch.votesGivenByCaller;
          votesRemaining[epoch.objectId] = epoch.votesRemaining;
        }

        setIsLoading(false);
      })
      .catch((err: any) => alert(err));
  }, []);

  return (
    <Container>
      <Accordion hidden>
        <AccordionSummary />
      </Accordion>
      {epochs.map((epoch, index) => (
        <Accordion
          disableGutters
          key={index}
          sx={{ border: "2px solid #00194A" }}
        >
          <AccordionSummary
            aria-controls="panel1d-content"
            id="panel1d-header"
            expandIcon={<ExpandMoreIcon />}
            sx={{ backgroundColor: "#00194A" }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Typography sx={{ width: "30%", flexShrink: 0 }}>
                {epoch.name}
              </Typography>
              <Typography sx={{ width: "30%", flexShrink: 0 }}>
                Started on {monthMap[epoch.startTime.getMonth()]}{" "}
                {epoch.startTime.getDate()}
              </Typography>
              <Typography sx={{ width: "30%", flexShrink: 0 }}>
                {epoch.type}
              </Typography>
              {epoch.active && <Chip label="Ongoing" color="primary" />}
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ backgroundColor: "#000f29" }}>
            <Grid container>
              <Grid item xs={8}>
                <TableContainer>
                  <Table aria-label="simple table" size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: "#99ccff" }}>
                          {epoch.type === "Contribution"
                            ? "Contributor"
                            : "Task"}
                        </TableCell>
                        {epoch.active === true && (
                          <TableCell align="right" sx={{ color: "#99ccff" }}>
                            Votes Given
                          </TableCell>
                        )}
                        {epoch.active === false &&
                          (data.access === "admin" ? (
                            <TableCell align="right" sx={{ color: "#99ccff" }}>
                              Value
                            </TableCell>
                          ) : (
                            <TableCell align="right" sx={{ color: "#99ccff" }}>
                              Votes Given
                            </TableCell>
                          ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {epoch.choices.map((choice, index) => (
                        <TableRow
                          key={index}
                          sx={{
                            "&:last-child td, &:last-child th": {
                              border: 0,
                            },
                          }}
                        >
                          <TableCell component="th" scope="row">
                            {epoch.type === "Contribution"
                              ? data.memberDetails[choice].username
                              : epoch.taskDetails[choice].title}
                          </TableCell>
                          {epoch.active === true && !isLoading && (
                            <TableCell align="right">
                              <TextField
                                id="filled-hidden-label-normal"
                                value={votesGiven[epoch.objectId][choice]}
                                type="number"
                                placeholder="Value"
                                size="small"
                                onChange={(event) => {
                                  handleVotesRemaining(
                                    epoch.objectId,
                                    choice,
                                    parseInt(event.target.value)
                                  );
                                  handleVotesGiven(
                                    epoch.objectId,
                                    choice,
                                    parseInt(event.target.value)
                                  );
                                }}
                              />
                            </TableCell>
                          )}
                          {data.access === "admin" && epoch.active === false && (
                            <TableCell align="right">
                              {choice in epoch.values && epoch.values[choice]
                                ? epoch.values[choice].toFixed(2)
                                : 0}{" "}
                              {epoch.token.symbol}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid item xs={4}>
                <DetailContainer>
                  {epoch.active && (
                    <InfoContainer>
                      <Typography
                        sx={{
                          color: "#99ccff",
                          textAlign: "right",
                          fontSize: 14,
                        }}
                      >
                        Votes remaining
                      </Typography>
                      <Typography sx={{ textAlign: "right" }}>
                        {votesRemaining[epoch.objectId]}
                      </Typography>
                    </InfoContainer>
                  )}
                  <InfoContainer>
                    <Typography
                      sx={{
                        color: "#99ccff",
                        textAlign: "right",
                        fontSize: 14,
                      }}
                    >
                      Total Budget
                    </Typography>
                    <Typography sx={{ textAlign: "right" }}>
                      {epoch.budget} {epoch.token.symbol}
                    </Typography>
                  </InfoContainer>
                  {epoch.active ? (
                    <ButtonContainer>
                      <PrimaryButton
                        endIcon={<SaveIcon />}
                        variant="outlined"
                        sx={{ mx: 4 }}
                        size="small"
                        onClick={() => {
                          saveVotes(
                            Moralis,
                            epoch.objectId,
                            votesGiven[epoch.objectId]
                          )
                            .then((res: any) => console.log(res))
                            .catch((err: any) => alert(err));
                        }}
                      >
                        Save
                      </PrimaryButton>
                      <PrimaryButton
                        endIcon={<CloseIcon />}
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          console.log(`hshsh`);
                          endEpoch(Moralis, epoch.objectId)
                            .then((res: any) => {
                              console.log(res);
                              handleEpochUpdateAfterSave(index, res);
                            })
                            .catch((err: any) => alert(err));
                        }}
                      >
                        End Epoch
                      </PrimaryButton>
                    </ButtonContainer>
                  ) : (
                    <ButtonContainer>
                      {epoch.type === "Contribution" ? (
                        <PrimaryButton
                          endIcon={<PaidIcon />}
                          variant="outlined"
                          sx={{ mx: 4 }}
                          size="small"
                          onClick={() => {}}
                        >
                          Payout countributors
                        </PrimaryButton>
                      ) : (
                        <PrimaryButton
                          endIcon={<PaidIcon />}
                          variant="outlined"
                          sx={{ mx: 4 }}
                          size="small"
                          onClick={() => {}}
                        >
                          Set task rewards
                        </PrimaryButton>
                      )}
                      <PrimaryButton
                        endIcon={<DownloadIcon />}
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          handleExport(epoch);
                        }}
                      >
                        Export to csv
                      </PrimaryButton>
                    </ButtonContainer>
                  )}
                </DetailContainer>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
`;

const DetailContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 0.5rem;
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const ButtonContainer = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
`;

export default EpochList;
