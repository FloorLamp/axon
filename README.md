# Axon

_The function of the axon is to transmit information to different neurons - [Wikipedia](https://en.wikipedia.org/wiki/Axon)._

Axon is a decentralized neuron management canister.

## Overview

- An Axon canister controls one or more neurons, either as a hot key or as sole controller (not possible until canisters can hold ICP)
- Axons have one or more Principals (operators) that manage its neurons
- `ManageNeuron` commands are sent to Axon, which queues them for voting
- Once a majority of operators vote yes to a command, it is forwarded to all controlled neurons
- Axons can be public and expose all neuron data
