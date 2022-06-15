import React from "react";
import axios from "axios";
import "./style.css";
import { withWrapper } from "./componentWrapper";
import $ from "jquery"
import {
    getFilePage,
    getUsersPage,
    getDisplayName
} from "./utils.js"

const SERVER_URL = process.env.REACT_APP_PROTOCOL
    + process.env.REACT_APP_DOMAIN;

class User extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            searchedFiles: [],
            searchedUsers: [],
            filesPage: 1,
            usersPage: 1,
            filesController: null,
            usersController: null,
            totalFiles: 0,
            filesInput: 1,
            usersInput: "",
            trustedUsers: {},
            displayname: null
        };

        this.handleUpload = this.handleUpload.bind(this);
        this.getFilePage = getFilePage.bind(this);
        this.getUsersPage = getUsersPage.bind(this);
        this.filePageInputKeyDown = this.filePageInputKeyDown.bind(this);
        this.handlePageEnter = this.filePageInputKeyDown.bind(this);
        this.getFileDisplayHTML = this.getFileDisplayHTML.bind(this);
        this.getFileUploadFormHTML = this.getFileUploadFormHTML.bind(this);
        this.getDisplayName = getDisplayName.bind(this);
    }

    componentDidMount() {
        this.getDisplayName();
        this.getFilePage(1)();
    }

    filePageInputKeyDown(e) {
        if (e.key === "Enter") {
            this.getFilePage(Number($("#page-number-input").val()))()
        }
    }

    handleUpload() {
        let file = document.getElementById("file-input").files[0];
        let comment = document.getElementById("comment-input").value;
        let privacy = document.getElementById("privacy-input").value;

        axios({
            method: "post",
            url: SERVER_URL + process.env.REACT_APP_UPLOAD_PATH,
            data: { 
                userFile: file,
                trustedUsers: JSON.stringify(this.state.trustedUsers),
                comment: comment,
                privacy: privacy
            },
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
            })
            .then(res => {
                console.log(res)
                this.setState({
                    trustedUsers: {}
                });
                this.getFilePage(this.state.filesPage)();
            })
            .catch(err => {
                console.error(err);
            });
        this.forceUpdate()
    }

    getFileDisplayHTML() {
        return (
            <div>
                {this.state.totalFiles !== null && <p>{this.state.totalFiles}</p>}
                <div id="page-navigator" className="page-navigator">
                    <button type="button" id="previous-page-button" className="page-button" onClick={this.getFilePage(this.state.filesPage-1)}>Previous</button>
                    <input  type="text"
                            id="page-number-input"
                            className="page-number-input"
                            value={this.state.filesInput}
                            onKeyDown={this.filePageInputKeyDown}
                            onChange={e => this.setState({ filesInput: e.target.value })}
                    />
                    <button type="button" id="next-page-button" className="page-button" onClick={this.getFilePage(this.state.filesPage+1)}>Next</button>
                </div>
                {this.state.searchedFiles.map(file => {
                    return (
                        <div key={file._id} className="file-meta-data">
                            <p><strong>{file._id}</strong></p>
                            <p>{file.fileName}</p>
                            <p>{file.privacy}</p>
                            <button
                                type="button"
                                className="open-file-button"
                                onClick={() => this.props.navigate(".." + process.env.REACT_APP_FILE_PAGE + "/" + file._id)}
                            >Open File</button>
                        </div>
                    )
                })}
            </div>
        )
    }

    getFileUploadFormHTML() {
        return (
            <form id="file-upload-form" className="file-upload-form">
                <label htmlFor="file-upload">Select a file:</label>
                <input type="file" id="file-input" className="file-input" name="userFile" />
                <select id="privacy-input" className="privacy-input" name="privacy" defaultValue="private">
                    <option value="private">Private</option>
                    <option value="shared">Shared</option>
                    <option value="public">Public</option>
                </select>
                <input type="text"
                       id="trusted-users-input"
                       className="trusted-users-input"
                       name="trustedUsers"
                       value={this.state.usersInput}
                       onChange={e => {this.getUsersPage(e.target.value, this.state.usersPage)()}}
                       maxLength="500"
                />
                <div className="users-display">
                    <div className="searched-users-display">
                        <button type="button"
                                id="previous-searched-users-button"
                                className="page-button"
                                onClick={this.getUsersPage(this.state.usersInput, this.state.searchedUsersPage-1)}
                                >Previous</button>
                        <button type="button"
                                id="next-searched-users-button"
                                className="page-button"
                                onClick={this.getUsersPage(this.state.usersInput, this.state.searchedUsersPage+1)}
                                >Next</button>
                        {this.state.searchedUsers.map(user => {
                            return (
                                <div key={user._id + "_searched"} className="user-item-display" onClick={() => {
                                    let trustedUsers = this.state.trustedUsers;
                                    trustedUsers[user._id] = user;
                                    this.setState({ trustedUsers: trustedUsers });
                                }}>
                                    {user.displayname + ": " + user._id}
                                </div>
                            )
                        })}
                    </div>
                    <div className="trusted-users-display">
                        {Object.values(this.state.trustedUsers).map(user => {
                            return (
                                <div key={user._id + "_trusted"} className="user-item-display" onClick={() => {
                                    let trustedUsers = this.state.trustedUsers;
                                    delete trustedUsers[user._id];
                                    this.setState({ trustedUsers: trustedUsers });
                                }}>
                                    {user.displayname + ": " + user._id}
                                </div>
                            )
                        })}
                    </div>
                </div>
                <input type="text" id="comment-input" className="comment-input" name="comment" defaultValue="" maxLength="500" />
                <input type="reset" id="file-reset-button" className="file-reset-button" value="Reset" />
                <button type="button" id="file-upload-button" className="file-upload-button" onClick={this.handleUpload}>Submit</button>
            </form>
        );
    }

    render() {
        return (
            <div className="user-page">
                { this.state.displayname !== null && <p>Hello user {this.state.displayname}</p> }
                {this.getFileUploadFormHTML()}
                {this.getFileDisplayHTML()}
            </div>
        )
    }
}

export default withWrapper(User)