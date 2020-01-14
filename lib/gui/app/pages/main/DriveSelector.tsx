/*
 * Copyright 2016 balena.io
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as _ from 'lodash';
import * as React from 'react';
import styled from 'styled-components';
import * as driveConstraints from '../../../../shared/drive-constraints';
import * as DriveSelectorModal from '../../components/drive-selector/DriveSelectorModal.jsx';
import * as TargetSelector from '../../components/drive-selector/target-selector.jsx';
import { SVGIcon } from '../../components/svg-icon/svg-icon';
import * as selectionState from '../../models/selection-state';
import * as settings from '../../models/settings';
import { observe, store } from '../../models/store';
import * as analytics from '../../modules/analytics';

const StepBorder = styled.div<{
	disabled: boolean;
	left?: boolean;
	right?: boolean;
}>`
	height: 2px;
	background-color: ${props =>
		props.disabled
			? props.theme.customColors.dark.disabled.foreground
			: props.theme.customColors.dark.foreground};
	position: absolute;
	width: 124px;
	top: 19px;

	left: ${props => (props.left ? '-67px' : undefined)};
	right: ${props => (props.right ? '-67px' : undefined)};
`;

const getDriveListLabel = () => {
	return _.join(
		_.map(selectionState.getSelectedDrives(), (drive: any) => {
			return `${drive.description} (${drive.displayName})`;
		}),
		'\n',
	);
};

const shouldShowDrivesButton = () => {
	return !settings.get('disableExplicitDriveSelection');
};

const getDriveSelectionStateSlice = () => ({
	showDrivesButton: shouldShowDrivesButton(),
	driveListLabel: getDriveListLabel(),
	targets: selectionState.getSelectedDrives(),
});

interface DriveSelectorProps {
	webviewShowing: boolean;
	disabled: boolean;
	nextStepDisabled: boolean;
	hasDrive: boolean;
	flashing: boolean;
}

export const DriveSelector = ({
	webviewShowing,
	disabled,
	nextStepDisabled,
	hasDrive,
	flashing,
}: DriveSelectorProps) => {
	// TODO: inject these from redux-connector
	const [
		{ showDrivesButton, driveListLabel, targets },
		setStateSlice,
	] = React.useState(getDriveSelectionStateSlice());
	const [showDriveSelectorModal, setShowDriveSelectorModal] = React.useState(
		false,
	);

	React.useEffect(() => {
		return observe(() => {
			setStateSlice(getDriveSelectionStateSlice());
		});
	}, []);

	const showStepConnectingLines = !webviewShowing || !flashing;

	return (
		<div className="box text-center relative">
			{showStepConnectingLines && (
				<React.Fragment>
					<StepBorder disabled={disabled} left />
					<StepBorder disabled={nextStepDisabled} right />
				</React.Fragment>
			)}

			<div className="center-block">
				<SVGIcon paths={['../../assets/drive.svg']} disabled={disabled} />
			</div>

			<div className="space-vertical-large">
				<TargetSelector
					disabled={disabled}
					show={!hasDrive && showDrivesButton}
					tooltip={driveListLabel}
					selection={selectionState}
					openDriveSelector={() => {
						setShowDriveSelectorModal(true);
					}}
					reselectDrive={() => {
						analytics.logEvent('Reselect drive', {
							applicationSessionUuid: store.getState().toJS()
								.applicationSessionUuid,
							flashingWorkflowUuid: store.getState().toJS()
								.flashingWorkflowUuid,
						});
						setShowDriveSelectorModal(true);
					}}
					flashing={flashing}
					constraints={driveConstraints}
					targets={targets}
				/>
			</div>

			{showDriveSelectorModal && (
				<DriveSelectorModal
					close={() => setShowDriveSelectorModal(false)}
				></DriveSelectorModal>
			)}
		</div>
	);
};
