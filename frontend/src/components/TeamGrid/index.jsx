import React from "react";
import { createPortal } from "react-dom";
import TeamCard from "../TeamCard";
import { useUserQueriesAndMutations } from "../utils/queries";
import { usePoke } from "../utils/hooks";
import Modal from "../Modal";
import Input from "../Input";
import { useForm } from "@tanstack/react-form";

const TeamGrid = ({ teams, limit = null, showControls = true }) => {
    if (limit) {
        teams = teams.slice(0, limit);
    }
    const { uidState } = usePoke();
    const { uid } = uidState;
    const { queries, mutations } = useUserQueriesAndMutations({ uid });
    const { teamDeleteMutation, teamCreateMutation } = mutations;

    const onDelete = async (team) => {
        console.log(`Deleting team ${team.tid}`);
        try {
            const res = await teamDeleteMutation.mutateAsync(team.tid);
            console.log({ res });
        } catch (e) {
            console.error({ e });
        }
    };

    const handleDelete = (e, callback) => {
        e.preventDefault();
        const modal = document.getElementById("confirmDeleteModal");
        const deleteButton = modal.querySelector("#deleteButton");
        const cancelButton = modal.querySelector("#cancelButton");

        deleteButton.onclick = () => {
            modal.close();
            callback();
        };

        cancelButton.onclick = () => {
            modal.close();
        };

        modal.showModal();
    };

    const handleCreate = (e) => {
        e.preventDefault();
        const modal = document.getElementById("createTeamModal");
        const cancelButton = modal.querySelector("#cancelButton");

        cancelButton.onclick = () => {
            modal.close();
        };

        modal.showModal();
    };

    const form = useForm({
        defaultValues: {
            teamName: "",
        },
        onSubmit: async ({ value }) => {
            const modal = document.getElementById("createTeamModal");
            try {
                const res = await teamCreateMutation.mutateAsync({ id: uid, name: value.teamName });
                console.log({ res });
                value.teamName = "";
                modal.close();
            } catch (e) {
                console.error({ e });
            }
        },
    });

    return (
        <div className="flex flex-col">
            {showControls ? (
                <button onClick={handleCreate} className="text-xl btn btn-primary">
                    Create Team
                </button>
            ) : (
                <></>
            )}
            <div className="flex flex-row flex-wrap">
                {teams.map((team, key) => (
                    <TeamCard
                        key={key}
                        handleDelete={(e) => handleDelete(e, async () => await onDelete(team))}
                        team={team}
                        showControls={showControls}
                    />
                ))}
            </div>
            {createPortal(
                <Modal id="confirmDeleteModal" title="Are you Sure?">
                    <p className="py-4">Are you sure you want to delete this team?</p>
                    <div className="modal-action">
                        <button id="deleteButton" className="btn btn-error">
                            Delete
                        </button>
                        <button id="cancelButton" className="btn btn-ghost">
                            Cancel
                        </button>
                    </div>
                </Modal>,
                document.body,
            )}
            {createPortal(
                <Modal id="createTeamModal" title="Create Team">
                    <form
                        className="form-control"
                        onSubmit={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            form.handleSubmit();
                        }}
                    >
                        <div>
                            <form.Field
                                name="teamName"
                                children={(field) => (
                                    <Input
                                        name={field.name}
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                    />
                                )}
                            />
                        </div>
                        <div className="flex flex-row justify-between modal-action">
                            <button className="w-1/2 btn btn-error" type="submit">
                                Create
                            </button>
                            <button type="reset" id="cancelButton" className="w-1/2 btn btn-ghost">
                                Cancel
                            </button>
                        </div>
                    </form>
                </Modal>,
                document.body,
            )}
        </div>
    );
};

export default TeamGrid;