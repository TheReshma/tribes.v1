import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Modal,
  Stepper,
  Step,
  StepLabel,
  styled,
  Typography,
  Chip,
  useTheme,
  Tooltip,
  Grid,
  Avatar,
} from "@mui/material";
import Approve, { ApprovalInfo } from "../batchPay/approve";
import BatchPay, { DistributionInfo } from "../batchPay/batchPay";
import { useMoralis } from "react-moralis";
import { useRouter } from "next/router";
import { useGlobal } from "../../../context/globalContext";
import { useSpace } from "../../../../pages/tribe/[id]/space/[bid]";
import PaidIcon from "@mui/icons-material/Paid";
import { Epoch } from "../../../types";
import { capitalizeFirstLetter } from "../../../utils/utils";
import { completeEpochPayment } from "../../../adapters/moralis";
import { notify } from "../settingsTab";
import { PrimaryButton } from "../../elements/styledComponents";
import { isApprovalRequired } from "../../../adapters/contract";

interface Props {
  epoch: Epoch;
}

const PayoutContributors = ({ epoch }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [steps, setSteps] = useState([] as string[]);
  const [showStepper, setShowStepper] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const {
    state: { registry },
  } = useGlobal();
  const { Moralis, user } = useMoralis();
  const { space, setSpace, setRefreshEpochs } = useSpace();
  console.log(epoch);
  const [distributionInfo, setDistributionInfo] = useState({
    contributors: Object.keys(epoch.values),
    tokenValues: Object.values(epoch.values),
    epochId: epoch.objectId,
    type: epoch.token.address === "0x0" ? "currency" : "tokens",
    tokenAddresses:
      epoch.token.address === "0x0"
        ? null
        : Array(Object.keys(epoch.values).length).fill(epoch.token.address),
  } as DistributionInfo);
  const [approvalInfo, setApprovalInfo] = useState({
    required: false,
    uniqueTokenAddresses: [epoch.token.address],
    aggregatedTokenValues: [epoch.budget],
  } as ApprovalInfo);

  const handleClose = () => {
    setIsOpen(false);
  };
  const handleNextStep = () => {
    if (steps.length > 0) {
      if (steps.length === activeStep) {
        handleClose();
      } else setActiveStep(activeStep + 1);
    } else {
      handleClose();
    }
  };

  const handleStatusUpdate = (epochId: string) => {
    completeEpochPayment(Moralis, epochId)
      .then((res: any) => {
        setRefreshEpochs(true);
      })
      .catch((err: any) => {
        notify(
          `Sorry! There was an error while updating the task status to 'Paid'. However, your payment went through.`,
          "error"
        );
      });
  };

  return (
    <>
      <PrimaryButton
        endIcon={<PaidIcon />}
        variant="outlined"
        disabled={epoch.paid}
        loading={isLoading}
        sx={{
          mx: 4,
          borderRadius: 1,
        }}
        size="small"
        color="secondary"
        onClick={() => {
          setIsLoading(true);
          if (epoch.token.address === "0x0") {
            setActiveStep(2);
            setIsLoading(false);
            setIsOpen(true);
          } else {
            isApprovalRequired(
              user?.get("ethAddress"),
              epoch.token.address,
              epoch.budget,
              window.ethereum.networkVersion
            ).then((reqd: boolean) => {
              console.log(reqd);
              if (reqd) {
                const temp = Object.assign({}, approvalInfo);
                temp.required = true;
                setApprovalInfo(temp);
                setActiveStep(0);
                setSteps(["Approve Tokens", "Batch Pay Tokens"]);
                setShowStepper(true);
              } else {
                setActiveStep(1);
              }
              setIsLoading(false);
              setIsOpen(true);
            });
          }
        }}
      >
        Payout countributors
      </PrimaryButton>
      <Modal open={isOpen} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Grid
            container
            spacing={0}
            direction="column"
            alignItems="center"
            justifyContent="center"
            style={{ minHeight: "10vh" }}
          >
            <Grid item xs={3}>
              <Box style={{ display: "flex" }}>
                <Avatar
                  src={registry[window.ethereum.networkVersion]?.pictureUrl}
                  sx={{
                    width: "2rem",
                    height: "2rem",
                    objectFit: "cover",
                    my: 1,
                  }}
                />
                <Typography
                  color="text.primary"
                  variant="h5"
                  marginBottom="10px"
                  marginLeft="10px"
                >
                  {capitalizeFirstLetter(
                    registry[window.ethereum.networkVersion]?.name
                  )}{" "}
                  Network
                </Typography>
              </Box>
            </Grid>
          </Grid>
          {showStepper && (
            <Stepper activeStep={activeStep}>
              {steps.map((label: any, index: number) => {
                const stepProps: { completed?: boolean } = {};
                const labelProps: {
                  optional?: React.ReactNode;
                } = {};
                return (
                  <Step key={label} {...stepProps}>
                    <StepLabel {...labelProps}>{label}</StepLabel>
                  </Step>
                );
              })}
            </Stepper>
          )}
          {activeStep === 0 && isOpen && !isLoading && (
            <Approve
              handleClose={handleClose}
              handleNextStep={handleNextStep}
              setActiveStep={setActiveStep}
              approvalInfo={approvalInfo}
              chainId={window.ethereum.networkVersion}
            />
          )}
          {activeStep === 1 && isOpen && !isLoading && (
            <BatchPay
              handleClose={handleClose}
              handleNextStep={handleNextStep}
              chainId={window.ethereum.networkVersion}
              distributionInfo={distributionInfo}
              handleStatusUpdate={handleStatusUpdate}
            />
          )}
          {activeStep === 2 && isOpen && (
            <BatchPay
              handleClose={handleClose}
              handleNextStep={handleNextStep}
              chainId={window.ethereum.networkVersion}
              distributionInfo={distributionInfo}
              handleStatusUpdate={handleStatusUpdate}
            />
          )}
        </Box>
      </Modal>{" "}
    </>
  );
};

export const modalStyle = {
  position: "absolute" as "absolute",
  top: "40%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "40rem",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export const Heading = styled("div")(({ theme }) => ({
  fontWeight: 500,
  fontSize: 16,
  color: theme.palette.text.secondary,
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  borderBottom: "1px solid #99ccff",
  padding: 16,
  paddingLeft: 32,
}));

export default PayoutContributors;